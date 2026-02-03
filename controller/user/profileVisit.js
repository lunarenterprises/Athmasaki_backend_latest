const model = require('../../model/user/profileVisit')
const { sanitizeUserList } = require("../../util/sanitize");
const { SendNotification } = require("../../util/sendnotification");

module.exports.ProfileVist = async (req, res) => {
    try {
        const { user_id, name } = req.user
        const { receiver_id } = req.body || {}
        console.log(req.user);

        if (!receiver_id) {
            return res.send({
                result: false,
                message: "visited profile id is required"
            })
        }

        const receiverData = await model.CheckReceiver(receiver_id)
        if (receiverData.length === 0) {
            return res.send({
                result: false,
                message: "User not found. Cannot view profile"
            })
        }

        const checkvisited = await model.checkVisited(user_id, receiver_id)

        if (checkvisited.length > 0) {
            return res.send({
                result: true
            })
        }
        const sended = await model.AddProfileVist(user_id, receiver_id)

        if (sended.affectedRows > 0) {

            await SendNotification({
                sender_id: user_id,
                receiver_id,
                message: `Your profile is visited by ${name}`,
                type: "profileVisit",
            });

            return res.send({
                result: true,
                message: "Profile visit added successfully"
            })

        } else {
            return res.send({
                result: false,
                message: "Failed to add profile visit. Please try again later"
            })
        }

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}


module.exports.ListProfileVisit = async (req, res) => {
    try {
        const { user_id, plan } = req.user

        let profilevisitlist = await model.ListProfileVisit(user_id)

        let getPlan = await model.GetPlanDetails(plan)

        // const profilevistAcess = getPlan[0]?.p_who_visited === 1;

        // if (profilevistAcess) {

            if (profilevisitlist.length > 0) {
                let ListProfileVisit = await Promise.all(
                    profilevisitlist.map(async (el) => {
                        el.profileimages = await model.GetprofileImage(el.i_receiver_id);
                        return el;
                    })
                );

                return res.send({
                    result: true,
                    message: "Data retrieved successfully",
                    data: ListProfileVisit
                })
            } else {
                return res.send({
                    result: true,
                    message: "No profile visit found",
                })
            }
        // } else {
        //     return res.send({
        //         result: true,
        //         message: "Please upgrade your plan to see who visited your profile",
        //     })
        // }

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.ListRejectInterest = async (req, res) => {
    try {
        const { user_id, plan } = req.user

        let ListInterestReject = await model.ListInterestReject(user_id)

        let getPlan = await model.GetPlanDetails(plan)

        // const profilevistAcess = getPlan[0]?.p_who_declined === 1;

        // if (profilevistAcess) {

            if (ListInterestReject.length > 0) {
                let ListProfileVisit = await Promise.all(
                    ListInterestReject.map(async (el) => {
                        el.profileimages = await model.GetprofileImage(el.i_receiver_id);
                        return el;
                    })
                );

                return res.send({
                    result: true,
                    message: "Data retrieved successfully",
                    data: ListProfileVisit
                })
            } else {
                return res.send({
                    result: true,
                    message: "No profile visit found",
                })
            }
        // } else {
        //     return res.send({
        //         result: true,
        //         message: "Please upgrade your plan to see who visited your profile",
        //     })
        // }

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}