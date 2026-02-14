const model = require('../../model/admin/addOnplan')

module.exports.CreateAddOnPlan = async (req, res) => {
    try {
        const { user_id } = req.user || {}

        const { name, price, interest_limit } = req.body

        if (!price || !interest_limit) {
            return res.send({
                result: false,
                message: "price and interest limit are required"
            })
        }

        const created = await model.CreateAddOnPlan(name, price, interest_limit)

        if (created.affectedRows > 0) {
            return res.send({
                result: true,
                message: "Add on Plan created successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to create Add on plan. Please try again later."
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}


module.exports.ListAddOnPlans = async (req, res) => {
    try {
        const { user_id } = req.user || {}

        const planData = await model.ListAllPlans()
        return res.send({
            result: true,
            message: "Data retrieved successfully",
            data: planData
        })
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.EditAddOnPlan = async (req, res) => {
    try {
        const { user_id } = req.user || {}
        const { plan_id, name, price, interest_limit } = req.body
        if (!plan_id) {
            return res.send({
                result: false,
                message: "Add on Plan id is required"
            })
        }
        const checkPlan = await model.CheckPlan(plan_id)
        if (checkPlan.length === 0) {
            return res.send({
                result: false,
                message: "Add on Plan data not found."
            })
        }

        let updates = []
        if (name !== undefined) updates.push(`ap_name = '${name}'`)
        if (price !== undefined) updates.push(`ap_price = '${price}'`)
        if (interest_limit !== undefined) updates.push(`ap_interest = '${interest_limit}'`)

        if (updates.length > 0) {
            const updateString = updates.join(', ');
            const updated = await model.UpdatePlan(updateString, plan_id)
            if (updated.affectedRows === 0) {
                return res.send({
                    result: false,
                    message: "Failed to update Add on plan"
                })
            }
        }

        return res.send({
            result: true,
            message: "Add on Plan updated successfully"
        })
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}


module.exports.DeleteAddOnPlan = async (req, res) => {
    try {
        const { user_id } = req.user || {}

        const { plan_id } = req.body
        if (!plan_id) {
            return res.send({
                result: false,
                message: "Add on Plan id is required"
            })
        }
        const checkPlan = await model.CheckPlan(plan_id)
        if (checkPlan.length === 0) {
            return res.send({
                result: false,
                message: "Add on Plan data not found"
            })
        }

        const deleted = await model.DeletePlan(plan_id)
        if (deleted.affectedRows > 0) {
            return res.send({
                result: true,
                message: "Add on Plan deleted successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to delete Add on Plan"
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}
