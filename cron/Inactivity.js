// controllers/inactivityController.js
const model = require('../model/user/Inactivity');
const { SendNotification } = require('../util/sendnotification'); // adjust to your actual path

module.exports.Inactivity = async () => {
    try {
        // Step 1: Get all users' last login info
        let inactiveUsers = await model.CheckInactivity();

        // console.log("inactiveUsers", inactiveUsers);

        for (const user of inactiveUsers) {

            let diffDays = user.days_since_last_login
            // console.log("diffDays", diffDays, user.user_id);

            // 1️⃣ 90 days inactive → Alert
            if (diffDays >= 90 && diffDays <= 92) {
                // console.log("90 days inactive");

                await SendNotification({
                    sender_id: 0, // system
                    receiver_id: user.user_id,
                    message: `We haven’t seen you in a while. Log in to keep your profile active.`,
                    type: "inactivity_warning_90",
                });
            }

            // 2️⃣ 6 months (≈180 days) inactive → Alert
            else if (diffDays >= 180 && diffDays <= 182) {
                // console.log("6 months inactive");

                await SendNotification({
                    sender_id: 0,
                    receiver_id: user.user_id,
                    message: `It’s been 6 months since your last visit. Log in soon to keep your profile visible.`,
                    type: "inactivity_warning_180",
                });
            }

            // 3️⃣ 9 months (≈270 days) inactive → Deactivate (hide)
            else if (diffDays >= 270 && diffDays <= 272) {
                // console.log("9 months inactive");

                await model.DeactivateUser(user.user_id); // should set profile hidden in DB
                await model.DeactivateUserMatch(user.user_id); // should set profile hidden in DB

                await SendNotification({
                    sender_id: 0,
                    receiver_id: user.user_id,
                    message: `Your account has been inactive for 9 months and is temporarily hidden. Log in to reactivate it.`,
                    type: "inactivity_deactivated",
                });
            }

            // 4️⃣ 11.5 months (≈350 days) inactive → Warn before deletion
            else if (diffDays == 350 && diffDays <= 352) {
                // console.log("11.5 months  inactive");

                await SendNotification({
                    sender_id: 0,
                    receiver_id: user.user_id,
                    message: `Still looking for matches? Log in within the next 15 days to keep your account active.`,
                    type: "inactivity_deletion_warning",
                });
            }

            // 5️⃣ 12 months (≈365 days) inactive → Delete permanently
            else if (diffDays >= 365) {
                // console.log("12 months  inactive");

                await model.DeleteUser(user.user_id);

                await SendNotification({
                    sender_id: 0,
                    receiver_id: user.user_id,
                    message: `Your account was deleted after 12 months of inactivity.`,
                    type: "inactivity_deleted",
                });
            }
        }

        console.log("✅ Inactivity check completed.");
        return true

    } catch (error) {
        console.error("❌ Inactivity check failed:", error);
    }
};
