const model = require("../../model/user/fieldVsibility");

module.exports.setVisibility = async (req, res) => {
    try {

        let { user_id, field_name, is_visible, image_id } = req.body;

        if (is_visible === undefined || is_visible === null) {
            return res.status(400).json({ result: false, message: "Missing required is_visible data" });
        }
        if ((is_visible == '0' || '1') == false) {
            return res.status(400).json({ result: false, message: "is_visible only allow 0 or 1" });
        }

        if (is_visible && image_id) {
            let CheckImage = await model.CheckImage(image_id, user_id)

            if (CheckImage.length > 0) {
                await model.UpdateImageVisibility(image_id, is_visible);

            } else {
                return res.status(400).json({ result: false, message: "Image data not found" });
            }
            return res.json({ result: true, message: "Image Visibility updated successfully" });
        }

        let checkvisibility = await model.Checkvisibility(user_id, field_name)

        if (checkvisibility.length == 0) {
            await model.InsertVisibility(user_id, field_name, is_visible);

        } else {
            await model.UpdateVisibility(user_id, field_name, is_visible);

        }

        return res.json({ result: true, message: "Visibility updated successfully" });

    } catch (error) {
        console.error("Error in setVisibility:", error);
        return res.status(500).json({ result: false, message: "Internal server error" });
    }
};

// Get all visibility settings for a user
// module.exports.getVisibility = async (req, res) => {
//     try {
//         const { user_id } = req.params;

//         if (!user_id) {
//             return res.status(400).json({ result: false, message: "User ID required" });
//         }

//         const settings = await model.getUserVisibility(user_id);

//         return res.json({ result: true, data: settings });
//     } catch (error) {
//         console.error("Error in getVisibility:", error);
//         return res.status(500).json({ result: false, message: "Internal server error" });
//     }
// };
