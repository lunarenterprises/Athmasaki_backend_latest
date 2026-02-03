const model = require('../../model/admin/birthStars')

module.exports.AddBirthStars = async (req, res) => {
    try {

        const { birthstars_name } = req.body

        if (!birthstars_name ) {
            return res.send({
                result: false,
                message: "Birth Stars and BirthStars answer are required"
            })
        }

        const checkBirthStars = await model.CheckBirthStarsquestion(birthstars_name)
        if (checkBirthStars.length > 0) {
            return res.send({
                result: true,
                message: "This BirthStars is already added"
            })
        }

        const addBirthStars = await model.AddBirthStars(birthstars_name)

        if (addBirthStars.affectedRows > 0) {
            return res.send({
                result: true,
                message: "Birth Stars added successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to add Birth Stars. Please try again."
            })
        }

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.ListBirthStars = async (req, res) => {
    try {
        const BirthStars = await model.ListBirthStars();

        if (BirthStars.length == 0) {
            return res.send({
                result: false,
                message: "failed to fetch Birth Stars list"
            });
        }

        return res.send({
            result: true,
            message: "Data retrieved successfully",
            data: BirthStars
        });

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        });
    }
};


module.exports.EditBirthStars = async (req, res) => {

    try {

        const { birthstars_id, birthstars_name } = req.body

        if (!birthstars_id) {
            return res.send({
                result: false,
                message: "Birth Stars id is required"
            })
        }

        const CheckBirthStars = await model.CheckBirthStars(birthstars_id)
        if (CheckBirthStars.length == 0) {
            return res.send({
                result: false,
                message: "Birth Stars not found."
            })
        }

        let updates = []
        if (birthstars_name !== undefined) updates.push(`birth_stars_name = '${birthstars_name}'`)

        if (updates.length > 0) {
            const updateString = updates.join(',');
            const updated = await model.UpdateBirthStars(updateString, birthstars_id)

            if (updated.affectedRows === 0) {
                return res.send({
                    result: false,
                    message: "Failed to update Birth Stars details"
                })
            }
        }

        return res.send({
            result: true,
            message: "Birth Stars details updated successfully"
        })

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.DeleteBirthStars = async (req, res) => {
    try {
        let birthstars_id = req.query.birthstars_id

        if (!birthstars_id) {
            return res.send({
                result: false,
                message: "BirthStars details id is required"
            })
        }
        const checkPlan = await model.CheckBirthStars(birthstars_id)

        if (checkPlan.length === 0) {
            return res.send({
                result: false,
                message: "Birth Stars details not found"
            })
        }
        const deleted = await model.DeleteBirthStars(birthstars_id)
        if (deleted.affectedRows > 0) {
            return res.send({
                result: true,
                message: "Birth Stars details deleted successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to delete Birth Stars details"
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}
