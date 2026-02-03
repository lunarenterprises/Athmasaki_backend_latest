const model = require('../../model/user/partnerPreference')

module.exports.UpdatePartnerPreference = async (req, res) => {
    try {
        const {
            pp_user_id,
            pp_from_age,
            pp_to_age,
            pp_gender,
            pp_religion,
            pp_community,
            pp_education,
            pp_profession,
            pp_smoking,
            pp_drinking,
            is_register,
        } = req.body;

        // console.log(pp_user_id,
        //     pp_from_age,
        //     pp_to_age,
        //     pp_gender,
        //     pp_religion,
        //     pp_community,
        //     pp_education,
        //     pp_profession,
        //     pp_smoking,
        //     pp_drinking);

        if (is_register == 'true') {
            if (!pp_user_id || !pp_from_age || !pp_to_age || !pp_gender || !pp_education || !pp_profession || !pp_smoking || !pp_drinking) {
                return res.send({
                    result: false,
                    message: "All fileds are required"
                })
            }
        }

        if (!pp_user_id) {
            return res.send({
                result: false,
                message: "user id is required"
            })
        }

        let checkuser = await model.CheckUser(pp_user_id)

        if (checkuser.affectedRows > 0) {
            return res.send({
                result: false,
                message: "user not found"
            })
        }

        const checkPreference = await model.CheckPreference(pp_user_id);

        if (!checkPreference || checkPreference.length === 0) {
            // Insert new partner preference
            const insertData = {
                pp_user_id,
                pp_from_age: pp_from_age || null,
                pp_to_age: pp_to_age || null,
                pp_gender: pp_gender || null,
                pp_religion: pp_religion || null,
                pp_community: pp_community || null,
                pp_education: pp_education || null,
                pp_profession: pp_profession || null,
                pp_smoking: pp_smoking || null,
                pp_drinking: pp_drinking || null,
            };

            let inserted = await model.InsertPartnerPreference(insertData);
            if (inserted.affectedRows == 1) {
                let updateuser = await model.ProfileCompletion(pp_user_id)
                if (updateuser.affectedRows == 0) {
                    return res.send({
                        result: false,
                        message: "failed to update profile completion"
                    });
                }
                return res.send({
                    result: true,
                    message: "Partner preference created successfully."
                });
            } else {
                return res.send({
                    result: false,
                    message: "Failed to create partner preference."
                });
            }
        } else {

            // Update existing partner preference
            let updates = [];
            if (pp_from_age !== undefined) updates.push(`pp_from_age='${pp_from_age}'`);
            if (pp_to_age !== undefined) updates.push(`pp_to_age='${pp_to_age}'`);
            if (pp_gender !== undefined) updates.push(`pp_gender='${pp_gender}'`);
            if (pp_religion !== undefined) updates.push(`pp_religion='${pp_religion}'`);
            if (pp_community !== undefined) updates.push(`pp_community='${pp_community}'`);
            if (pp_education !== undefined) updates.push(`pp_education='${pp_education}'`);
            if (pp_profession !== undefined) updates.push(`pp_profession="${pp_profession}"`);
            if (pp_smoking !== undefined) updates.push(`pp_smoking="${pp_smoking}"`);
            if (pp_drinking !== undefined) updates.push(`pp_drinking="${pp_drinking}"`);

            if (updates.length === 0) {
                return res.send({
                    result: false,
                    message: "No fields to update."
                });
            }

            const updateString = updates.join(",");
            const preferenceId = checkPreference[0].pp_id;

            let updated = await model.UpdatePartnerPreference(updateString, preferenceId);

            if (updated.affectedRows === 1) {
                let updateuser = await model.ProfileCompletion(pp_user_id)
                if (updateuser.affectedRows == 0) {
                    return res.send({
                        result: false,
                        message: "failed to update profile completion"
                    });
                }

                return res.send({
                    result: true,
                    message: "Partner preference updated successfully."
                });
            } else {
                return res.send({
                    result: false,
                    message: "Failed to update partner preference."
                });
            }
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        });
    }
};

module.exports.ListPartnerPreference = async (req, res) => {
    try {
        const { user_id } = req.user

        const listdata = await model.CheckPreference(user_id)
        const columnames = await model.Checkcolumnames()

        if (listdata.length == 0) {
            return res.send({
                result: false,
                message: "Failed to retrieved data",
                data: columnames
            })
        }
        return res.send({
            result: true,
            message: "Data retrieved successfully",
            data: listdata
        })
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}