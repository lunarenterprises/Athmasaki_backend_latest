var db = require('../../config/db');
var util = require("util");
const query = util.promisify(db.query).bind(db);


module.exports = {
    // ✅ User functions
    getUserById: (user_id) => {
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT u_id, u_first_name,u_last_name FROM users WHERE u_id = ? LIMIT 1`,
                [user_id],
                (err, results) => err ? reject(err) : resolve(results[0] || null)
            );
        });
    },

    // ✅ Chat functions
    getChatsByUserId: (user_id) => {
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT 
    c.id, 
    c.sender_id, 
    c.receiver_id, 

    u1.u_first_name AS sender_first_name,
    u1.u_last_name  AS sender_last_name,
    si.ui_file        AS sender_image,

    u2.u_first_name AS receiver_first_name,
    u2.u_last_name  AS receiver_last_name,
    ri.ui_file        AS receiver_image

FROM chats c
JOIN users u1 ON u1.u_id = c.sender_id
JOIN users u2 ON u2.u_id = c.receiver_id

-- one image for sender
LEFT JOIN (
    SELECT ui.ui_u_id, ui.ui_file
    FROM user_images ui
    WHERE ui.ui_visibility_status = 0
    GROUP BY ui.ui_u_id
    ORDER BY MIN(ui.ui_id)
) si ON si.ui_u_id = u1.u_id

-- one image for receiver
LEFT JOIN (
    SELECT ui.ui_u_id, ui.ui_file
    FROM user_images ui
    WHERE ui.ui_visibility_status = 0
    GROUP BY ui.ui_u_id
    ORDER BY MIN(ui.ui_id)
) ri ON ri.ui_u_id = u2.u_id

WHERE c.sender_id = ? OR c.receiver_id = ?
ORDER BY c.updated_at DESC `,


                // `SELECT 
                //                 c.id, 
                //                 c.sender_id, 
                //                 c.receiver_id, 
                //                 u1.u_first_name AS sender_firstname,
                //                 u1.u_last_name  AS sender_lastname,
                //                 u2.u_first_name AS receiver_firstname,
                //                 u2.u_last_name  AS receiver_lastname
                //              FROM chats c 
                //              JOIN users u1 ON u1.u_id = c.sender_id 
                //              JOIN users u2 ON u2.u_id = c.receiver_id 
                //              WHERE c.sender_id = ? OR c.receiver_id = ? 
                //              ORDER BY c.updated_at DESC`,
                [user_id, user_id],
                (err, results) => err ? reject(err) : resolve(results)
            );
        });
    },




    findOrCreateChat: (user_id, receiver_id) => {
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT * FROM chats 
                 WHERE (sender_id = ? AND receiver_id = ?) 
                    OR (sender_id = ? AND receiver_id = ?) LIMIT 1`,
                [user_id, receiver_id, receiver_id, user_id],
                (err, results) => {
                    if (err) return reject(err);
                    if (results.length > 0) return resolve(results[0]);

                    // create new chat
                    db.query(
                        `INSERT INTO chats (sender_id, receiver_id, created_at, updated_at) 
                         VALUES (?, ?, NOW(), NOW())`,
                        [user_id, receiver_id],
                        (err2, res) => {
                            if (err2) return reject(err2);
                            resolve({ id: res.insertId, sender_id: user_id, receiver_id });
                        }
                    );
                }
            );
        });
    },

    //get user and chat data
    getChatUsers: (chat_id, sender_id) => {
        return new Promise((resolve, reject) => {
            db.query(
                "SELECT * FROM chats WHERE id = ? AND (sender_id = ? OR receiver_id = ?)",
                [chat_id, sender_id, sender_id],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result); // returns array of chat rows
                }
            );
        });
    },


    //check user blocked or not
    isUserBlocked: (receiver_id, sender_id) => {
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT 1 
             FROM matches 
             WHERE ((m_user_id = ? AND m_matched_user_id = ?) 
                    OR (m_user_id = ? AND m_matched_user_id = ?))
               AND m_blocked = 1
             LIMIT 1`,
                [receiver_id, sender_id, sender_id, receiver_id],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result.length > 0); // true if blocked, false if not
                }
            );
        });
    },



    // ✅ Message functions
    createMessage: (chat_id, sender_id, message) => {
        return new Promise((resolve, reject) => {
            db.query(
                `INSERT INTO messages (chat_id, sender_id, message, is_read, created_at) 
                 VALUES (?, ?, ?, 0, NOW())`,
                [chat_id, sender_id, message],
                (err, res) => {
                    if (err) return reject(err);
                    resolve({ id: res.insertId, chat_id, sender_id, message, created_at: new Date() });
                }
            );
        });
    },

    getMessagesByChatId: (chat_id) => {
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at ASC`,
                [chat_id],
                (err, results) => err ? reject(err) : resolve(results)
            );
        });
    },

    // returns true if either user blocked the other
    isChatBlocked: (userId, partnerId) => {
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT 1 FROM blocked_users 
             WHERE (bu_sender_id = ? AND bu_blocked_id = ?)
                OR (bu_sender_id = ? AND bu_blocked_id = ?)
             LIMIT 1`,
                [userId, partnerId, partnerId, userId],
                (err, results) => err ? reject(err) : resolve(results.length > 0)
            );
        });
    },



    getLastMessage: (chat_id) => {
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at DESC LIMIT 1`,
                [chat_id],
                (err, results) => err ? reject(err) : resolve(results[0] || null)
            );
        });
    },

    getUnreadCount: (chat_id, user_id) => {
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT COUNT(*) as count 
                 FROM messages 
                 WHERE chat_id = ? AND is_read = 0 AND sender_id != ?`,
                [chat_id, user_id],
                (err, results) => err ? reject(err) : resolve(results[0].count)
            );
        });
    },

    markMessagesRead: (chat_id, user_id) => {
        return new Promise((resolve, reject) => {
            db.query(`UPDATE messages 
                 SET is_read = 1
                 WHERE chat_id = ? AND sender_id != ? AND is_read = 0`,
                [chat_id, user_id],
                (err, results) => err ? reject(err) : resolve(results)
            );
        });
    }
};
