const model = require('../model/user/register')


// module.exports.generateProfileId = async () => {
//     const prefix = "ASM";
//     let profile_id;

//     // Get last profile
//     const checklastId = await model.checkIfExists();

//     if (Array.isArray(checklastId) && checklastId.length > 0) {
//         const last_referral = checklastId[0].u_profile_id;
//         const lastNumber = parseInt(last_referral.replace(prefix, ""), 10);

//         // Increment and preserve leading zeros (4 digits)
//         const next_id = (lastNumber + 1).toString().padStart(4, "0");
//         profile_id = prefix + next_id;
//     } else {
//         // First ID
//         profile_id = prefix + "0001";
//     }

//     console.log("New Profile ID:", profile_id);
//     return profile_id;
// };



module.exports.generateProfileId = async () => {
    const prefix = "ASM";
    let profile_id;
    try {
        // Get the last profile record from the DB
        const checklastId = await model.checkIfExists();
        console.log("checklastId result:", checklastId);

        if (Array.isArray(checklastId) && checklastId.length > 0) {
            // Adjust this field name according to your DB result

            const last_referral = checklastId[0].u_profile_id;
            console.log("Last profile ID from DB:", last_referral);

            if (last_referral && typeof last_referral === "string") {
                // Remove prefix and parse number
                const numberPart = last_referral.replace(prefix, "");
                const lastNumber = parseInt(numberPart, 10);

                // Increment safely, preserve 4 digits
                const next_id = (isNaN(lastNumber) ? 1 : lastNumber + 1)
                    .toString()
                    .padStart(4, "0");

                profile_id = prefix + next_id;
            } else {
                // If invalid or missing last_referral
                profile_id = prefix + "0001";
            }
        } else {
            // If no previous record found
            profile_id = prefix + "0001";
        }

        console.log("New Profile ID:", profile_id);
        return profile_id;

    } catch (error) {
        console.error("Error generating profile ID:", error);
        // Fallback to a default if something breaks
        return prefix + "0001";
    }
};

