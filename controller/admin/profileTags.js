const model = require('../../model/admin/profileTags')

module.exports.AddProfileTags = async (req, res) => {
    try {

        const { tags_name } = req.body

        if (!tags_name) {
            return res.send({
                result: false,
                message: "Profile Tags name required"
            })
        }

        const addProfileTags = await model.AddProfileTags(tags_name)

        if (addProfileTags.affectedRows > 0) {
            return res.send({
                result: true,
                message: "Profile tags added successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to add Profile tags. Please try again."
            })
        }

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.ListProfileTags = async (req, res) => {
    try {

        const ProfileTagss = await model.ListProfileTags();

        return res.send({
            result: true,
            message: "Data retrieved successfully",
            data: ProfileTagss
        });

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        });
    }
};

module.exports.EditProfileTags = async (req, res) => {

    try {

        const { pft_id, tags_name } = req.body

        if (!pft_id) {
            return res.send({
                result: false,
                message: "Profile tags id is required"
            })
        }

        const checkPlan = await model.CheckProfileTags(pft_id)
        if (checkPlan.length === 0) {
            return res.send({
                result: false,
                message: "Profile tags not found."
            })
        }

        let updates = []
        if (tags_name !== undefined) updates.push(`pft_name = '${tags_name}'`)

        if (updates.length > 0) {
            const updateString = updates.join(',');
            const updated = await model.UpdateProfileTags(updateString, pft_id)

            if (updated.affectedRows === 0) {
                return res.send({
                    result: false,
                    message: "Failed to update Profile tags details"
                })
            }
        }

        return res.send({
            result: true,
            message: "Profile tags details updated successfully"
        })

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.DeleteProfileTags = async (req, res) => {
    try {
        let pft_id = req.query.pft_id

        if (!pft_id) {
            return res.send({
                result: false,
                message: "Profile tags details id is required"
            })
        }
        const checkPlan = await model.CheckProfileTags(pft_id)

        if (checkPlan.length === 0) {
            return res.send({
                result: false,
                message: "Profile tags details not found"
            })
        }

        const deleted = await model.DeleteProfileTags(pft_id)
        if (deleted.affectedRows > 0) {
            return res.send({
                result: true,
                message: "Profile tags details deleted successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to delete Profile tags details"
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}
