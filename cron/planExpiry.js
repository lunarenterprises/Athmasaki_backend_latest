// controllers/PlanExpiryController.js
const model = require('../model/user/Inactivity');
const { SendNotification } = require('../util/sendnotification');

module.exports.PlanExpiry = async () => {
    try {

        let planexpireduser = await model.CheckPlanExpiry();

        for (const user of planexpireduser) {
            // console.log("userdetails",user.s_user_id,user.s_end_date,user.s_interest_limit);

            // --- SEND NOTIFICATION WITH PLAN NAME ---
            await SendNotification({
                sender_id: 0, // system
                receiver_id: user.s_user_id,
                message: `Your “${user.s_plan_name}” is no longer active. Subscribe to our exclusive plans and move closer to your soulmate ❤️!`,
                type: "PlanExpired",
            });

            // --- UPDATE USER STATUS TO INACTIVE ---
            await model.UpdateUserStatusInactive(user.s_user_id);
        }

        // console.log("✅ Plan expiry notifications sent & users set inactive.");
        return true;

    } catch (error) {
        console.error("❌ PlanExpiry check failed:", error);
    }
};
