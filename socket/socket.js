const model = require('../model/user/chat'); // single combined model
const interestNotificationModel = require('../model/user/interestNotification');

// Shared state for external access
let ioInstance = null;
const onlineUsers = new Map();

// Export getters for external access (used by interest controller)
module.exports.getOnlineUsers = () => onlineUsers;
module.exports.getIO = () => ioInstance;

module.exports.initSocket = function (io) {
    ioInstance = io;

    function broadcastOnlineList() {
        const allOnline = Array.from(onlineUsers.keys());

        for (const [userId, sockId] of onlineUsers.entries()) {
            const filtered = allOnline.filter(id => id !== userId); // remove your own id
            const socketInstance = io.sockets.sockets.get(sockId);

            if (socketInstance) {
                socketInstance.emit("onlineUsers", filtered);
            }
        }
    }

    io.on("connection", (socket) => {
        console.log(`🔌 Socket ${socket.id} connected`);

        const timer = setTimeout(() => {
            console.log("⏳ Unidentified Idle socket timed out:", socket.id);
            socket.disconnect(true);
        }, 10000);

        // Online user
        socket.on("userOnline", ({ user_id }) => {
            if (!user_id) return;

            clearTimeout(timer);
            onlineUsers.set(user_id, socket.id);
            console.log("✅ Online user:", user_id);

            broadcastOnlineList();
        });

        // List chats
socket.on("listChats", async ({ user_id }) => {
    try {
        const user = await model.getUserById(user_id);
        if (!user) return socket.emit("error", "User not found");

        const chats = await model.getChatsByUserId(user_id);
        const payload = [];

        for (const c of chats) {
            const isSender = c.sender_id === user_id;

            const partner = isSender
                ? {
                    id: c.receiver_id,
                    firstname: c.receiver_first_name,
                    lastname: c.receiver_last_name,
                    image: c.receiver_image
                }
                : {
                    id: c.sender_id,
                    firstname: c.sender_first_name,
                    lastname: c.sender_last_name,
                    image: c.sender_image
                };

            // 🚫 Skip chat if blocked (either side)
            const blocked = await model.isChatBlocked(user_id, partner.id);
            if (blocked) continue;

            const lastMessage = await model.getLastMessage(c.id);
            const unreadCount = await model.getUnreadCount(c.id, user_id);
            const isOnline = onlineUsers.has(partner.id);

            payload.push({
                chat_id: c.id,
                partner,
                lastMessage,
                lastMessageTime: lastMessage?.created_at || 0,
                unreadCount,
                isOnline
            });
        }

        payload.sort(
            (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
        );

        socket.emit("chats", payload);

    } catch (err) {
        console.error("listChats error:", err);
        socket.emit("error", "Could not fetch chat list");
    }
});


        // Join room
        socket.on("joinRoom", async ({ user_id, receiver_id }) => {
            try {
                if (!receiver_id) {
                    socket.emit("error", { message: "Receiver id is required" });
                    return;
                }

                // 🚫 Check if either user blocked the other
                const blocked = await model.isChatBlocked(user_id, receiver_id);
                if (blocked) {
                    socket.emit("error", { message: "Cannot join chat — user is blocked" });
                    return;
                }

                const chat = await model.findOrCreateChat(user_id, receiver_id);
                const room = String(chat.id);

                const isOnline = onlineUsers.has(receiver_id);

                socket.join(room);

                const messages = await model.getMessagesByChatId(chat.id);

                io.to(room).emit("joined", {
                    chat_id: chat.id,
                    messages,
                    isOnline
                });

            } catch (err) {
                console.error("joinRoom error:", err);
                socket.emit("error", { message: "Could not join room" });
            }
        });

        // Send message
        // socket.on("sentMessage", async ({ chat_id, sender_id, message }) => {
        //     try {
                
        //         const saved = await model.createMessage(chat_id, sender_id, message);
        //         io.to(String(chat_id)).emit("message", saved);
        //     } catch (err) {
        //         console.error("sentMessage error:", err);
        //         socket.emit("error", "Message not sent");
        //     }
        // });


socket.on("sentMessage", async ({ chat_id, sender_id, message }) => {
    try {
        // 1️⃣ Get chat row
        const chatRows = await model.getChatUsers(chat_id, sender_id); 

        if (!chatRows.length) {
            return socket.emit("error", "Chat not found");
        }

        const chat = chatRows[0];

        // 2️⃣ Determine receiver_id (the user who is NOT the sender)
        const receiver_id = chat.sender_id === sender_id ? chat.receiver_id : chat.sender_id;

        // 3️⃣ Check if receiver blocked the sender
        const isBlocked = await model.isUserBlocked(receiver_id, sender_id);
        if (isBlocked) {
            return socket.emit("error", "You cannot send message. You are blocked by the user.");
        }

        // 4️⃣ Save message
        const saved = await model.createMessage(chat_id, sender_id, message);

        // 5️⃣ Emit to room
        io.to(String(chat_id)).emit("message", saved);

    } catch (err) {
        console.error("sentMessage error:", err);
        socket.emit("error", "Message not sent");
    }
});





        // Typing
        socket.on("typing", ({ chat_id, user_id }) => {
            socket.to(String(chat_id)).emit("typing", { user_id });
        });

        socket.on("stopTyping", ({ chat_id, user_id }) => {
            socket.to(String(chat_id)).emit("stopTyping", { user_id });
        });

        // Read receipts
        socket.on("messageRead", async ({ chat_id, user_id }) => {
            await model.markMessagesRead(chat_id, user_id);
            socket.to(String(chat_id)).emit("messagesRead", {
                chat_id,
                reader_id: user_id
            });
        });

        // Mark interest notification as read (independent from chat notifications)
        socket.on("markInterestNotificationRead", async ({ notification_id, user_id }) => {
            try {
                if (!notification_id || !user_id) {
                    return socket.emit("error", "notification_id and user_id are required");
                }

                const result = await interestNotificationModel.markInterestNotificationAsRead(notification_id, user_id);

                if (result.affectedRows > 0) {
                    // Emit badge update back to user
                    const unreadCount = await interestNotificationModel.getUnreadInterestCount(user_id);
                    socket.emit("interestNotificationReadUpdate", {
                        notification_id,
                        unread_count: unreadCount
                    });
                }
            } catch (err) {
                console.error("markInterestNotificationRead error:", err);
                socket.emit("error", "Could not mark notification as read");
            }
        });


        // Disconnect
        socket.on("disconnect", () => {
            for (const [userId, sockId] of onlineUsers.entries()) {
                if (sockId === socket.id) {
                    onlineUsers.delete(userId);
                    break;
                }
            }

            broadcastOnlineList();
        });
    });
};





// module.exports = function (io) {
//     const onlineUsers = new Map();

//     function broadcastOnlineList() {
//         const allOnline = Array.from(onlineUsers.keys());
//         for (const [key, sockId] of onlineUsers.entries()) {
//             const filtered = allOnline.filter(k => k !== key);
//             const socketInstance = io.sockets.sockets.get(sockId);
//             if (socketInstance) {
//                 socketInstance.emit("onlineUsers", filtered);
//             }
//         }
//     }


//     io.on("connection", (socket) => {
//         console.log(`🔌 Socket ${socket.id} connected`);

//         const timer = setTimeout(() => {
//             console.log("⏳ Unidentified Idle socket timed out:", socket.id);
//             socket.disconnect(true);
//         }, 10000);

//         // Online user
//         socket.on("userOnline", ({ user_id }) => {
//             if (!user_id) return;
//             clearTimeout(timer);
//             onlineUsers.set(user_id, socket.id);
//             console.log("✅ Online user:", user_id);
//             broadcastOnlineList();
//         });

//         // List chats
//         socket.on("listChats", async ({ user_id }) => {
//             try {
//                 const user = await model.getUserById(user_id);
//                 if (!user) return socket.emit("error", "User not found");

//                 const chats = await model.getChatsByUserId(user_id);
//                 const payload = [];
//                 console.log(chats, "chats");

//                 for (const c of chats) {
//                     const isSender = c.sender_id === user_id;
//                     const partner = isSender
//                         ? { id: c.receiver_id, firstname: c.receiver_first_name, lastname: c.receiver_last_name, receiver_image: c.receiver_image }
//                         : { id: c.sender_id, firstname: c.sender_first_name, lastname: c.sender_last_name, sender_image: c.sender_image };

//                     const lastMessage = await model.getLastMessage(c.id);
//                     const unreadCount = await model.getUnreadCount(c.id, user_id);

//                     const isOnline = onlineUsers.has(c.receiver_id)
                    
//                     payload.push({ chat_id: c.id, partner, lastMessage, unreadCount, isOnline });
//                 }

//                 socket.emit("chats", payload);
//             } catch (err) {
//                 console.error("listChats error:", err);
//                 socket.emit("error", "Could not fetch chat list");
//             }
//         });

//         // Join room
//         socket.on("joinRoom", async ({ user_id, receiver_id }) => {
//             try {
//                 if (!receiver_id) {
//                     socket.emit("error", { message: "Receiver id is required" });
//                     return;
//                 }

//                 const chat = await model.findOrCreateChat(user_id, receiver_id);

//                 const room = String(chat.id);
//                 const isOnline = onlineUsers.has(receiver_id)

//                 socket.join(room);
//                 const messages = await model.getMessagesByChatId(chat.id);

//                 io.to(room).emit("joined", { chat_id: chat.id, messages, isOnline });

//             } catch (err) {
//                 console.error("joinRoom error:", err);
//                 socket.emit("error", { message: "Could not join room" });
//             }
//         });

//         // Send message
//         socket.on("sentMessage", async ({ chat_id, sender_id, message }) => {
//             try {
//                 const saved = await model.createMessage(chat_id, sender_id, message);
//                 io.to(String(chat_id)).emit("message", saved);
//             } catch (err) {
//                 console.error("sentMessage error:", err);
//                 socket.emit("error", "Message not sent");
//             }
//         });

//         // Typing
//         socket.on("typing", ({ chat_id, user_id }) => {
//             socket.to(String(chat_id)).emit("typing", { user_id });
//         });

//         socket.on("stopTyping", ({ chat_id, user_id }) => {
//             socket.to(String(chat_id)).emit("stopTyping", { user_id });
//         });

//         // Read receipts
//         socket.on("messageRead", async ({ chat_id, user_id }) => {
//             await model.markMessagesRead(chat_id, user_id);
//             socket.to(String(chat_id)).emit("messagesRead", { chat_id, reader_id: user_id });
//         });

//         // Disconnect
//         socket.on("disconnect", () => {
//             for (const [userKey, sockId] of onlineUsers.entries()) {
//                 if (sockId === socket.id) {
//                     onlineUsers.delete(userKey);
//                     break;
//                 }
//             }
//             broadcastOnlineList();
//         });
//     });
// };
