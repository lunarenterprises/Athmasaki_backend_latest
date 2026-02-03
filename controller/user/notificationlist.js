const model = require('../../model/user/sendnotification')

module.exports.ListNotification = async (req, res) => {
    try {
        const { user_id } = req.user;
        let { status } = req.body || {};
        let condition = "";

        // Handle optional status filter safely
        if (status && typeof status === "string") {
            const safeStatus = status.toLowerCase();
            condition = `AND LOWER(n_type) = '${safeStatus}'`;
        }

        // Fetch notifications
        let Listnotification = await model.ListNotification(user_id, condition);

        if (Listnotification.length > 0) {
            
            // Count unread notifications
            const unreadcount = Listnotification.filter(n => !n.n_is_read || n.n_is_read === 0).length;

            // Enrich with user data
            let Allnotification = await Promise.all(
                Listnotification.map(async (el) => {
                    let otherUser;
                    let otherUserimages;

                    if (el.n_sender_id === user_id) {
                        // Current user is sender, so get receiver
                        otherUser = await model.GetUser(el.n_receiver_id);
                        otherUserimages = await model.GetUserImage(el.n_receiver_id);
                    } else {
                        // Current user is receiver, so get sender
                        otherUser = await model.GetUser(el.n_sender_id);
                        otherUserimages = await model.GetUserImage(el.n_sender_id); // fixed here
                    }

                    if (otherUser.length > 0) {
                        otherUser[0].images = otherUserimages;
                    }

                    el.otherUser = otherUser;
                    return el;
                })
            );

            return res.send({
                result: true,
                message: "Data retrieved successfully",
                unreadcount:unreadcount,
                data: Allnotification
            });
        } else {
            return res.send({
                result: true,
                message: "No notifications found",
                unreadcount: 0
            });
        }

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        });
    }
};


module.exports.ReadNotification = async (req, res) => {
    try {
        const { user_id } = req.user

        let updatenotification = await model.ReadNotification(user_id)

        if (updatenotification.affectedRows > 0) {

            return res.send({
                result: true,
                message: "notification read successfully",
                // unreadcount:,
            });
        } else {
            return res.send({
                result: true,
                message: "No notifications read",
            });
        }

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        });
    }
}