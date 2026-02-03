const model = require('../../model/admin/career')

module.exports.AddCareer = async (req, res) => {
    try {

        const { career_name } = req.body

        if (!career_name ) {
            return res.send({
                result: false,
                message: "Career name is required"
            })
        }

        const checkCareer = await model.CheckCareername(career_name)
        if (checkCareer.length > 0) {
            return res.send({
                result: true,
                message: "This Career is already added"
            })
        }

        const addCareer = await model.AddCareer(career_name)

        if (addCareer.affectedRows > 0) {
            return res.send({
                result: true,
                message: "Career added successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to add Career. Please try again."
            })
        }

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.ListCareer = async (req, res) => {
    try {
        const Career = await model.ListCareer();

        if (Career.length == 0) {
            return res.send({
                result: false,
                message: "failed to fetch Career list"
            });
        }

        return res.send({
            result: true,
            message: "Data retrieved successfully",
            data: Career
        });

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        });
    }
};


module.exports.EditCareer = async (req, res) => {

    try {

        const { career_id, career_name } = req.body

        if (!career_id) {
            return res.send({
                result: false,
                message: "Career id is required"
            })
        }

        const CheckCareer = await model.CheckCareer(career_id)
        if (CheckCareer.length == 0) {
            return res.send({
                result: false,
                message: "Career not found."
            })
        }

        let updates = []
        if (career_name !== undefined) updates.push(`career_name = '${career_name}'`)

        if (updates.length > 0) {
            const updateString = updates.join(',');
            const updated = await model.UpdateCareer(updateString, career_id)

            if (updated.affectedRows === 0) {
                return res.send({
                    result: false,
                    message: "Failed to update Career details"
                })
            }
        }

        return res.send({
            result: true,
            message: "Career details updated successfully"
        })

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.DeleteCareer = async (req, res) => {
    try {
        let career_id = req.query.career_id

        if (!career_id) {
            return res.send({
                result: false,
                message: "Career details id is required"
            })
        }
        const checkPlan = await model.CheckCareer(career_id)

        if (checkPlan.length === 0) {
            return res.send({
                result: false,
                message: "Career details not found"
            })
        }
        const deleted = await model.DeleteCareer(career_id)
        if (deleted.affectedRows > 0) {
            return res.send({
                result: true,
                message: "Career details deleted successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to delete Career details"
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}
