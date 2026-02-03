const model = require('../../model/admin/language')

module.exports.AddLanguage = async (req, res) => {
    try {

        const { Language_name } = req.body

        if (!Language_name) {
            return res.send({
                result: false,
                message: "Language name is required"
            })
        }

        const checkLanguage = await model.CheckLanguagename(Language_name)
        if (checkLanguage.length > 0) {
            return res.send({
                result: true,
                message: "This Language is alredy added"
            })
        }

        const addLanguage = await model.AddLanguage(Language_name)

        if (addLanguage.affectedRows > 0) {
            return res.send({
                result: true,
                message: "Language added successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to add Language. Please try again."
            })
        }

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.ListLanguage = async (req, res) => {
    try {

        const Languages = await model.ListLanguage();

        // const formattedLanguages = Languages.map(Language => {
        //     const optionsArray = Language.Language_name ? Language.Language_name.split(',') : [];
        //     return {
        //         [Language.Language_name]: optionsArray
        //     };
        // });

        return res.send({
            result: true,
            message: "Data retrieved successfully",
            data: Languages
        });

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        });
    }
};

module.exports.EditLanguage = async (req, res) => {

    try {

        const { language_id, Language_name } = req.body

        if (!language_id) {
            return res.send({
                result: false,
                message: "Language id is required"
            })
        }

        const checkPlan = await model.CheckLanguage(language_id)
        if (checkPlan.length === 0) {
            return res.send({
                result: false,
                message: "Language not found."
            })
        }

        let updates = []
        if (Language_name !== undefined) updates.push(`language_name = '${Language_name}'`)

        if (updates.length > 0) {
            const updateString = updates.join(',');
            const updated = await model.UpdateLanguage(updateString, language_id)

            if (updated.affectedRows === 0) {
                return res.send({
                    result: false,
                    message: "Failed to update Language details"
                })
            }
        }

        return res.send({
            result: true,
            message: "Language details updated successfully"
        })

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.DeleteLanguage = async (req, res) => {
    try {
        let language_id = req.query.language_id

        if (!language_id) {
            return res.send({
                result: false,
                message: "Language details id is required"
            })
        }

        const checkPlan = await model.CheckLanguage(language_id)

        if (checkPlan.length === 0) {
            return res.send({
                result: false,
                message: "Language details not found"
            })
        }

        const deleted = await model.DeleteLanguage(language_id)
        if (deleted.affectedRows > 0) {
            return res.send({
                result: true,
                message: "Language details deleted successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to delete Language details"
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}
