const model = require('../../model/admin/education')

module.exports.AddEducation = async (req, res) => {
    try {

        const { education_name } = req.body

        if (!education_name) {
            return res.send({
                result: false,
                message: "Education and Education answer are required"
            })
        }

        const checkEducation = await model.CheckEducationname(education_name)
        if (checkEducation.length > 0) {
            return res.send({
                result: true,
                message: "This Education is already added"
            })
        }

        const addEducation = await model.AddEducation(education_name)

        if (addEducation.affectedRows > 0) {
            return res.send({
                result: true,
                message: "Education added successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to add Education. Please try again."
            })
        }

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.ListEducation = async (req, res) => {
    try {
        const Education = await model.ListEducation();

        if (Education.length == 0) {
            return res.send({
                result: false,
                message: "failed to fetch Education list"
            });
        }

        return res.send({
            result: true,
            message: "Data retrieved successfully",
            data: Education
        });

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        });
    }
};


module.exports.EditEducation = async (req, res) => {

    try {

        const { education_id, education_name } = req.body

        if (!education_id) {
            return res.send({
                result: false,
                message: "Education id is required"
            })
        }

        const CheckEducation = await model.CheckEducation(education_id)
        if (CheckEducation.length == 0) {
            return res.send({
                result: false,
                message: "Education not found."
            })
        }

        let updates = []
        if (education_name !== undefined) updates.push(`education_name = '${education_name}'`)

        if (updates.length > 0) {
            const updateString = updates.join(',');
            const updated = await model.UpdateEducation(updateString, education_id)

            if (updated.affectedRows === 0) {
                return res.send({
                    result: false,
                    message: "Failed to update Education details"
                })
            }
        }

        return res.send({
            result: true,
            message: "Education details updated successfully"
        })

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.DeleteEducation = async (req, res) => {
    try {
        let education_id = req.query.education_id

        if (!education_id) {
            return res.send({
                result: false,
                message: "Education details id is required"
            })
        }
        const checkPlan = await model.CheckEducation(education_id)

        if (checkPlan.length === 0) {
            return res.send({
                result: false,
                message: "Education details not found"
            })
        }
        const deleted = await model.DeleteEducation(education_id)
        if (deleted.affectedRows > 0) {
            return res.send({
                result: true,
                message: "Education details deleted successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to delete Education details"
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}
