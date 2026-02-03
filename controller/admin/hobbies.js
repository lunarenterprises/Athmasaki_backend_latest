const model = require('../../model/admin/hobbies')

module.exports.AddHobbies = async (req, res) => {
    try {

        const { Hobbies_name } = req.body

        if (!Hobbies_name) {
            return res.send({
                result: false,
                message: "Hobbies name and Hobbies options are required"
            })
        }
        
        const checkHobbies = await model.CheckHobbiesname(Hobbies_name)
        if (checkHobbies.length > 0) {
            return res.send({
                result: true,
                message: "This Hobbie is alredy added"
            })
        }
        const addHobbies = await model.AddHobbies(Hobbies_name)

        if (addHobbies.affectedRows > 0) {
            return res.send({
                result: true,
                message: "Hobbies added successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to add Hobbies. Please try again."
            })
        }

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.ListHobbies = async (req, res) => {
    try {

        const Hobbiess = await model.ListHobbies();

        return res.send({
            result: true,
            message: "Data retrieved successfully",
            data: Hobbiess
        });

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        });
    }
};

module.exports.EditHobbies = async (req, res) => {

    try {

        const { hob_id, Hobbies_name } = req.body

        if (!hob_id) {
            return res.send({
                result: false,
                message: "Hobbies id is required"
            })
        }

        const checkPlan = await model.CheckHobbies(hob_id)
        if (checkPlan.length === 0) {
            return res.send({
                result: false,
                message: "Hobbies not found."
            })
        }

        let updates = []
        if (Hobbies_name !== undefined) updates.push(`hob_name = '${Hobbies_name}'`)

        if (updates.length > 0) {
            const updateString = updates.join(',');
            const updated = await model.UpdateHobbies(updateString, hob_id)

            if (updated.affectedRows === 0) {
                return res.send({
                    result: false,
                    message: "Failed to update Hobbies details"
                })
            }
        }

        return res.send({
            result: true,
            message: "Hobbies details updated successfully"
        })

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.DeleteHobbies = async (req, res) => {
    try {
        let hob_id = req.query.hob_id

        if (!hob_id) {
            return res.send({
                result: false,
                message: "Hobbies details id is required"
            })
        }
        const checkPlan = await model.CheckHobbies(hob_id)

        if (checkPlan.length === 0) {
            return res.send({
                result: false,
                message: "Hobbies details not found"
            })
        }

        const deleted = await model.DeleteHobbies(hob_id)
        if (deleted.affectedRows > 0) {
            return res.send({
                result: true,
                message: "Hobbies details deleted successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to delete Hobbies details"
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}
