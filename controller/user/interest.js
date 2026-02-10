const model = require('../../model/user/interest')
const { sanitizeUserList } = require("../../util/sanitize");
const { SendNotification } = require("../../util/sendnotification");
const interestNotificationModel = require('../../model/user/interestNotification');
const { getOnlineUsers, getIO } = require('../../socket/socket');

module.exports.SendInterest = async (req, res) => {
    try {

        const { user_id, profile_id } = req.user
        const { receiver_id } = req.body || {}
        if (!receiver_id) {
            return res.send({
                result: false,
                message: "Receiver id is required"
            })
        }

        const receiverData = await model.CheckReceiver(receiver_id)
        if (receiverData.length === 0) {
            return res.send({
                result: false,
                message: "User not found. Cannot send request"
            })
        }

        let checkinterestlimit = await model.CheckInterestLimit(user_id)

        if (checkinterestlimit.length > 0) {

            if (checkinterestlimit[0]?.s_interest_limit == 0) {
                let updateplanstatus = await model.UpdatePlanStatus(checkinterestlimit[0]?.s_id)
                if (updateplanstatus.affectedRows > 0) {
                    return res.send({
                        result: false,
                        planexpiry: true,
                        message: "You exceed your interest request limit or your plan expired. Please renew or upgrade your subscription plan to continue sending interest requests."
                    })
                } else {
                    return res.send({
                        result: false,
                        message: "Failed to update plan status"
                    })
                }
            }

            const checkAlreadySend = await model.CheckInterestSended(user_id, receiver_id)
            if (checkAlreadySend.length > 0) {
                return res.send({
                    result: false,
                    message: "Interest already sent"
                })
            }

            const sended = await model.SendInterest(user_id, receiver_id)
            if (sended.affectedRows > 0) {
                let balanceinterest = checkinterestlimit[0]?.s_interest_limit - 1


                let updateinterestlimit = await model.UpdateInterestLimit(balanceinterest, checkinterestlimit[0]?.s_id)

                if (updateinterestlimit.affectedRows > 0) {

                    await SendNotification({
                        sender_id: user_id,
                        receiver_id,
                        message: `You’ve received new interest ❤️`,
                        type: "interestRequest",
                    });

                    // Emit real-time interest notification to receiver if online
                    try {
                        const notification = await interestNotificationModel.createInterestNotification(
                            user_id, receiver_id, 'interest_sent'
                        );
                        console.log("notification : ", notification)
                        const senderDetails = await interestNotificationModel.getUserDetailsForNotification(user_id);
                        const onlineUsers = getOnlineUsers();
                        const io = getIO();

                        const receiverSocketId = onlineUsers.get(receiver_id);
                        if (receiverSocketId && io) {
                            io.sockets.sockets.get(receiverSocketId)?.emit("interestNotification", {
                                notification_id: notification.insertId,
                                from_user_id: user_id,
                                to_user_id: receiver_id,
                                type: 'interest_sent',
                                show_badge: true,
                                created_at: new Date().toISOString()
                            });
                        }
                    } catch (err) {
                        console.error("Interest notification emit error:", err);
                        // Don't fail the request if notification fails
                    }

                    return res.send({
                        result: true,
                        message: "Interest sent"
                    })

                } else {
                    return res.send({
                        result: false,
                        message: "Failed to update interest limit"
                    })
                }

            } else {
                return res.send({
                    result: false,
                    message: "Failed to send interest. Please try again later"
                })
            }

        } else {
            return res.send({
                result: false,
                planexpiry: true,
                message: "Your plan has expired. Upgrade now to continue sending interests"
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.SendDislike = async (req, res) => {
    try {
        const { user_id } = req.user

        const { receiver_id } = req.body || {}

        if (!receiver_id) {
            return res.send({
                result: false,
                message: "Receiver id is required"
            })
        }

        const receiverData = await model.CheckReceiver(receiver_id)
        if (receiverData.length === 0) {
            return res.send({
                result: false,
                message: "User not found. Cannot send request"
            })
        }

        const checkAlreadySend = await model.Checkmatch(user_id, receiver_id)

        if (checkAlreadySend.length == 0) {
            return res.send({
                result: false,
                message: "user not in your match"
            })
        }
        if (checkAlreadySend[0]?.m_dislike == 1) {
            return res.send({
                result: false,
                message: "Already skipped"
            })
        }

        const sended = await model.SendDislike(checkAlreadySend[0]?.m_id)
        if (sended.affectedRows > 0) {
            // const checkWishlist = await model.CheckWishlist(user_id, receiver_id)
            // if (checkWishlist.length > 0) {
            //     await model.RemoveFromWishlist(user_id, receiver_id)
            // }
            return res.send({
                result: true,
                message: "Profile Skipped"
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to send Dislike. Please try again later"
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.SendBlock = async (req, res) => {
    try {
        const { user_id, profile_id } = req.user
        console.log(req.user);

        const { receiver_id, reason } = req.body || {}
        if (!receiver_id) {
            return res.send({
                result: false,
                message: "Receiver id is required"
            })
        }
        // console.log(user_id);

        const receiverData = await model.CheckReceiver(receiver_id)
        if (receiverData.length === 0) {
            return res.send({
                result: false,
                message: "User not found. Cannot send request"
            })
        }

        const checkAlreadySend = await model.CheckBlock(user_id, receiver_id)

        if (checkAlreadySend.length > 0) {
            return res.send({
                result: false,
                message: "You already Blocked this user"
            })
        }

        const sended = await model.SendBlock(user_id, receiver_id, reason)

        if (sended.affectedRows > 0) {

            await SendNotification({
                sender_id: user_id,
                receiver_id,
                message: `${profile_id}'s profile is no longer available for you`,
                type: "block",
            });

            return res.send({
                result: true,
                message: "You blocked the user successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to Block user. Please try again later"
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.SendUnBlock = async (req, res) => {
    try {
        const { user_id, profile_id } = req.user
        console.log(req.user);

        const { receiver_id } = req.body || {}
        if (!receiver_id) {
            return res.send({
                result: false,
                message: "Receiver id is required"
            })
        }

        const receiverData = await model.CheckReceiver(receiver_id)
        if (receiverData.length === 0) {
            return res.send({
                result: false,
                message: "User not found. Cannot unblock user"
            })
        }

        const checkAlreadySend = await model.CheckBlock(user_id, receiver_id)

        if (checkAlreadySend.length == 0) {
            return res.send({
                result: false,
                message: "user not found in blocking list"
            })
        }

        const sended = await model.SendUnBlock(checkAlreadySend[0]?.bu_id)

        if (sended.affectedRows > 0) {

            await SendNotification({
                sender_id: user_id,
                receiver_id,
                message: `You can view ${profile_id}’s profile again `,
                type: "unblock",
            });

            return res.send({
                result: true,
                message: "Unblocked successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to unblock user. Please try again later"
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.ListInterests = async (req, res) => {
    try {
        const { user_id } = req.user
        const { status } = req.body || {}

        let condition = ''
        if (status) {
            condition = `AND i.i_status ='${status}'`
        }
        let interestData = await model.ListInterests(user_id, condition)
        let updatedUser = await sanitizeUserList(interestData, user_id);

        if (updatedUser.length > 0) {
            let ListInterests = await Promise.all(
                updatedUser.map(async (el) => {
                    el.profileimages = await model.GetprofileImage(el.u_id);
                    return el;
                })
            );

            return res.send({
                result: true,
                message: "Data retrieved successfully",
                data: ListInterests
            })

        } else {
            return res.send({
                result: true,
                message: "No interest found",
            })
        }

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.ListDislikedUser = async (req, res) => {
    try {
        const { user_id } = req.user
        const { u_id } = req.body || {}

        let condition = ''
        if (u_id) {
            condition = `AND u.u_id ='${u_id}'`
        }
        let interestData = await model.ListInterests(user_id, condition)
        let updatedUser = await sanitizeUserList(interestData, user_id);

        if (updatedUser.length > 0) {
            let ListInterests = await Promise.all(
                updatedUser.map(async (el) => {
                    el.profileimages = await model.GetprofileImage(el.u_id);
                    return el;
                })
            );

            return res.send({
                result: true,
                message: "Data retrieved successfully",
                data: ListInterests
            })
        } else {
            return res.send({
                result: true,
                message: "No interest found",
            })
        }

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.ListIncomingInterests = async (req, res) => {
    try {
        const { user_id } = req.user
        console.log("user_id", user_id);

        const { status } = req.body || {}
        let condition = ''
        if (status) {
            condition = `AND i.i_status ='${status}'`
        }
        const interestData = await model.ListIncomingInterests(user_id, condition)
        let updatedUser = await sanitizeUserList(interestData, user_id);

        if (updatedUser.length > 0) {
            let ListInterests = await Promise.all(
                updatedUser.map(async (el) => {
                    el.profileimages = await model.GetprofileImage(el.u_id);
                    return el;
                })
            );

            return res.send({
                result: true,
                message: "Data retrieved successfully",
                data: ListInterests
            })
        } else {

            return res.send({
                result: true,
                message: "No incoming interest found",
            })
        }

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.ListBlockedUser = async (req, res) => {
    try {
        const { user_id, role } = req.user
        const { u_id } = req.body || {}

        let blockedData

        let condition = ''
        if (u_id) {
            condition = `AND u.u_id ='${u_id}'`
        }

        if (role == "user") {

            blockedData = await model.ListBlocked(user_id, condition)
            // let updatedUser = await sanitizeUserList(blockedData, user_id);
        } else {
            blockedData = await model.AdminListBlocked()
        }

        if (blockedData.length > 0) {
            let ListblockedData = await Promise.all(
                blockedData.map(async (el) => {
                    el.profileimages = await model.GetprofileImage(el.u_id);
                    return el;
                })
            );

            return res.send({
                result: true,
                message: "Data retrieved successfully",
                data: ListblockedData
            })
        } else {
            return res.send({
                result: true,
                message: "No blocked user found",
            })
        }

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.DeleteSendedInterests = async (req, res) => {

    try {
        const { interest_id } = req.body
        if (!interest_id) {
            return res.send({
                result: false,
                message: "Interest id is required"
            })
        }
        const DeleteInterests = await model.DeleteSendedInterests(interest_id)
        if (DeleteInterests.affectedRows === 0) {
            return res.send({
                result: false,
                message: "Failed to remove interest. Please try again later"
            })
        } else {
            return res.send({
                result: true,
                message: "Interest removed successfully",
            })
        }

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.UpdateInterestStatus = async (req, res) => {
    try {
        const { user_id, profile_id, name } = req.user
        const { status, interest_id } = req.body
        if (!status || !["accepted", "rejected"].includes(status) || !interest_id) {
            return res.send({
                result: false,
                message: "Status and interests id are required and status should be one of ['accepted', 'rejected']"
            })
        }

        const interestData = await model.CheckInterestWithId(interest_id, user_id)
        if (interestData.length === 0) {
            return res.send({
                result: false,
                message: "Interest data not found."
            })
        }

        if (interestData[0]?.i_status !== "pending") {
            return res.send({
                result: false,
                message: `Interest already ${interestData[0]?.i_status}`
            })
        }

        // Accept/Reject → only receiver can do this
        if ((status === "accepted" || status === "rejected") && interestData[0]?.i_receiver_id !== user_id) {
            return res.send({
                result: false,
                message: "Only the receiver can accept or reject the interest"
            });
        }

        // Cancel → only sender can do this
        // if (status === "cancelled" && interestData.i_sender_id !== user_id) {
        //     return res.send({
        //         result: false,
        //         message: "Only the sender can cancel the interest"
        //     });
        // }


        const updated = await model.UpdateInterestStatus(interest_id, status)
        if (updated.affectedRows > 0) {

            if (status == 'accepted') {
                await SendNotification({
                    sender_id: user_id,
                    receiver_id: interestData[0]?.i_sender_id,
                    message: `${name} has accepted your interest `,
                    type: "acceptinterestStatus",
                });

                // Emit real-time interest accepted notification to original sender if online
                try {
                    const notification = await interestNotificationModel.createInterestNotification(
                        user_id, interestData[0]?.i_sender_id, 'interest_accepted'
                    );
                    const accepterDetails = await interestNotificationModel.getUserDetailsForNotification(user_id);
                    const onlineUsers = getOnlineUsers();
                    const io = getIO();

                    const originalSenderSocketId = onlineUsers.get(interestData[0]?.i_sender_id);
                    if (originalSenderSocketId && io) {
                        io.sockets.sockets.get(originalSenderSocketId)?.emit("interestNotification", {
                            notification_id: notification.insertId,
                            from_user_id: user_id,
                            from_user_firstname: accepterDetails?.u_first_name || '',
                            from_user_lastname: accepterDetails?.u_last_name || '',
                            from_user_image: accepterDetails?.profile_image || '',
                            to_user_id: interestData[0]?.i_sender_id,
                            type: 'interest_accepted',
                            is_notification_read: true,
                            created_at: new Date().toISOString()
                        });
                    }
                } catch (err) {
                    console.error("Interest accepted notification emit error:", err);
                    // Don't fail the request if notification fails
                }
            }
            if (status == 'rejected') {
                await SendNotification({
                    sender_id: user_id,
                    receiver_id: interestData[0]?.i_sender_id,
                    message: `Your interest was declined. Keep exploring - your match is still out there.`,
                    type: "rejectinterestStatus",
                });
            }

            return res.send({
                result: true,
                message: "Interest Status updated successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to update status. Please try again later"
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.GetUserProfile = async (req, res) => {
    try {
        const { user_id } = req.user
        const { partner_id } = req.body
        if (!partner_id) {
            return res.send({
                result: false,
                message: "Partner id is required"
            })
        }
        const partnerData = await model.GetPartnerData(partner_id)

        let datalist = await Promise.all(
            partnerData.map(async (el) => {
                el.profileimages = await model.GetprofileImage(el.u_id);
                return el;
            })
        );

        if (partnerData.length === 0) {

            return res.send({
                result: false,
                message: "User not found. Invalid user id."
            })
        }

        return res.send({
            result: true,
            message: "Data retrieved successfully",
            data: datalist
        })

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}