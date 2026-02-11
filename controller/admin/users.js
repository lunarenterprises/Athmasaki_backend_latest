const model = require('../../model/admin/users')
const { sanitizeUserList } = require('../../util/sanitize')
const { SendNotification } = require("../../util/sendnotification");


// module.exports.ListAllUsers = async (req, res) => {
//     try {
//         const admin_id = req?.user?.user_id

//         let { u_id, status, verify_status, start_date, end_date, profile_id } = req.body || {}
//         if (u_id) {
//             const userData = await model.CheckUser(u_id)
//             if (!userData || userData.length === 0) {
//                 return res.send({
//                     result: false,
//                     message: "User data not found. Invalid user id"
//                 })
//             }
//         }
//         let condition = ''
//         if (verify_status) {
//             const validStatuses = ['verified', 'rejected', 'pending'];

//             if (!validStatuses.includes(verify_status)) {
//                 return res.send({
//                     result: true,
//                     message: "Invalid Status"
//                 });
//             }

//             condition = `and u_verify_profile ='${verify_status}'`
//         }
//         if (status) {

//             const validStatuses = ['active', 'reject', 'inactive', 'pending'];

//             if (!validStatuses.includes(status)) {
//                 return res.send({
//                     result: true,
//                     message: "Invalid Status"
//                 });
//             }

//             condition = `and u_status ='${status}'`
//         }

//         if (profile_id) {
//             condition = `and u_profile_id ='${profile_id}'`
//         }

//         if (start_date && end_date) {
//             condition = `and u_createdAt between '${start_date}' and '${end_date}'`
//         }

//         const usersData = await model.ListAllUsers(condition);
//         // console.log("usersData", usersData);

//         let sanitizedUsers = await sanitizeUserList(usersData, admin_id) || [];
//         // console.log("sanitizedUsers", sanitizedUsers);

//         if (!Array.isArray(sanitizedUsers)) {
//             sanitizedUsers = [sanitizedUsers];
//         }

//         const updatedData = await Promise.all(
//             sanitizedUsers.map(async (el) => {
//                 const userSubscriptionData = await model.GetUserSubscriptionData(el?.u_id);
//                 const profileimages = await model.GetprofileImage(el?.u_id);

//                 return { ...el, profileimages, subscription: userSubscriptionData[0] || null };
//             })
//         );

//         return res.send({
//             result: true,
//             message: "Data retrieved successfully",
//             data: updatedData
//         })

//     } catch (error) {
//         return res.send({
//             result: false,
//             message: error.message
//         })
//     }
// }

module.exports.ListAllUsers = async (req, res) => {
    try {
        const admin_id = req?.user?.user_id;

        let { u_id, status, verify_status, start_date, end_date, profile_id, search } = req.body || {};

        let conditions = [];
        let params = [];

        if (u_id) {
            const userData = await model.CheckUser(u_id);
            if (!userData || userData.length === 0) {
                return res.send({
                    result: false,
                    message: "User data not found. Invalid user id"
                });
            }
        }

        // 🔍 SEARCH
        if (search && search.trim()) {
            const key = `%${search.trim().toLowerCase()}%`;

            const searchConditions = [
                "LOWER(u_country) LIKE ?",
                "LOWER(u_state) LIKE ?",
                "LOWER(u_district) LIKE ?",
                "LOWER(u_location) LIKE ?",
                "LOWER(u_diet) LIKE ?",
                "LOWER(u_religion) LIKE ?",
                "LOWER(u_community) LIKE ?",
                "LOWER(u_mother_tongue) LIKE ?",
                "LOWER(u_work) LIKE ?",
                "LOWER(u_highest_qualification) LIKE ?",
                "LOWER(u_birth_star) LIKE ?"
            ];

            conditions.push(`(${searchConditions.join(" OR ")})`);
            params.push(...Array(searchConditions.length).fill(key));
        }

        // ✅ VERIFY STATUS
        if (verify_status) {
            const validStatuses = ['verified', 'rejected', 'pending'];

            if (!validStatuses.includes(verify_status)) {
                return res.send({
                    result: true,
                    message: "Invalid Status"
                });
            }
            conditions.push("u_verify_profile = ?");
            params.push(verify_status);
        }

        // ✅ STATUS
        if (status) {
            const validStatuses = ['active', 'reject', 'inactive', 'pending'];

            if (!validStatuses.includes(status)) {
                return res.send({
                    result: true,
                    message: "Invalid Status"
                });
            }
            conditions.push("u_status = ?");
            params.push(status);
        }

        // ✅ PROFILE ID
        if (profile_id) {
            conditions.push("u_profile_id = ?");
            params.push(profile_id);
        }

        // ✅ DATE RANGE
        if (start_date && end_date) {
            conditions.push("u_createdAt BETWEEN ? AND ?");
            params.push(start_date, end_date);
        }

        const finalCondition = conditions.length
            ? "AND " + conditions.join(" AND ")
            : "";

        const usersData = await model.ListAllUsers(finalCondition, params);

        let sanitizedUsers = await sanitizeUserList(usersData, admin_id) || [];

        return res.send({
            result: true,
            message: "Data retrieved successfully",
            data: sanitizedUsers
        });

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        });
    }
};



module.exports.UpdateUserStatus = async (req, res) => {
    try {
        const admin_id = req?.user?.user_id
        const { user_id, status, reason } = req.body
        if (!user_id) {
            return res.send({
                result: false,
                message: "User id is required"
            })
        }
        const validStatuses = ['active', 'reject', 'inactive'];

        if (!validStatuses.includes(status)) {
            return res.send({
                result: true,
                message: "Invalid Status"
            });
        }
        const userData = await model.CheckUser(user_id)
        if (!userData || userData.length === 0) {
            return res.send({
                result: false,
                message: "User data not found. Invalid user id"
            })
        }

        const updated = await model.UpdateStatus(user_id, status, reason)
        if (updated.affectedRows > 0) {
            if (status == 'active') {
                await SendNotification({
                    sender_id: '',
                    receiver_id: user_id,
                    message: `Congratulations! Your profile is approved. Start connecting with genuine matches today. 💖`,
                    type: "profileApprovel",
                });
            } else {
                await SendNotification({
                    sender_id: '',
                    receiver_id: user_id,
                    message: `Profile rejected. Please complete the missing or incorrect details to continue.`,
                    type: "profileApprovel",
                });
            }

            return res.send({
                result: true,
                message: "Status updated successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to update status. Please try again later."
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}