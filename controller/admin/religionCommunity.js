const model = require('../../model/admin/religionCommunity')

module.exports.AddReligion = async (req, res) => {
    try {
        const { user_id } = req.user || {}

        const { religion_name } = req.body

        if (!religion_name) {
            return res.send({
                result: false,
                message: "religion name is required"
            })
        }

        const checkreligion = await model.Checkreligionname(religion_name)

        if (checkreligion.length > 0) {
            return res.send({
                result: false,
                message: "Religion already exists"
            })
        }

        const addreligion = await model.AddReligion(religion_name)

        if (addreligion.affectedRows > 0) {
            return res.send({
                result: true,
                message: "Religion added successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to add religion. Please try again later."
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.AddCommunity = async (req, res) => {
    try {
        const { user_id } = req.user || {}

        const { r_id, community_name } = req.body

        if (!community_name || !r_id) {
            return res.send({
                result: false,
                message: "community name is required"
            })
        }

        const checkcommunity = await model.Checkcommunityname(community_name, r_id)

        if (checkcommunity.length > 0) {
            return res.send({
                result: false,
                message: "Community already exists"
            })
        }

        const addcommunity = await model.AddCommunity(r_id, community_name)

        if (addcommunity.affectedRows > 0) {
            return res.send({
                result: true,
                message: "community added successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to add community. Please try again later."
            })
        }

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.Listreligion = async (req, res) => {
    try {
        const { user_id } = req.user || {}

        const religion = await model.Listreligion()
        return res.send({
            result: true,
            message: "Data retrieved successfully",
            data: religion
        })
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.ListCommunity = async (req, res) => {
    try {
        const { user_id } = req.user || {}
        let r_id = req.query.r_id
        console.log(r_id);
        let condition = ''
        if (r_id) {
            condition = `where cm_religion_id ='${r_id}'`

        }
        const religion = await model.ListCommunity(condition)
        return res.send({
            result: true,
            message: "Data retrieved successfully",
            data: religion
        })
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.EditReligion = async (req, res) => {
    try {
        const { user_id } = req.user || {}
        const { r_id, r_name } = req.body
        if (!r_id) {
            return res.send({
                result: false,
                message: "religion id is required"
            })
        }
        const checkPlan = await model.Checkreligion(r_id)
        if (checkPlan.length === 0) {
            return res.send({
                result: false,
                message: "religion not found."
            })
        }
        let updates = []
        if (r_name !== undefined) updates.push(`r_name = '${r_name}'`)

        if (updates.length > 0) {
            const updateString = updates.join(',');
            const updated = await model.UpdateReligion(updateString, r_id)

            if (updated.affectedRows === 0) {
                return res.send({
                    result: false,
                    message: "Failed to update Subscription plan"
                })
            }
        }

        return res.send({
            result: true,
            message: "Religion details updated successfully"
        })

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.EditCommunity = async (req, res) => {
    try {
        const { user_id } = req.user || {}
        const { cm_id, cm_r_id, cm_name } = req.body
        if (!cm_id || !cm_r_id) {
            return res.send({
                result: false,
                message: "community id is required"
            })
        }
        const CheckCommunity = await model.CheckCommunity(cm_id)
        if (CheckCommunity.length === 0) {
            return res.send({
                result: false,
                message: "community not found."
            })
        }

        let updates = []
        if (cm_r_id !== undefined) updates.push(`cm_r_id = '${cm_r_id}'`)
        if (cm_name !== undefined) updates.push(`cm_name = '${cm_name}'`)

        if (updates.length > 0) {
            const updateString = updates.join(',');
            const updated = await model.UpdateCommunity(updateString, cm_id)

            if (updated.affectedRows === 0) {
                return res.send({
                    result: false,
                    message: "Failed to update community details"
                })
            }
        }

        return res.send({
            result: true,
            message: "Community details updated successfully"
        })

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.DeleteReligion = async (req, res) => {
    try {
        const { user_id } = req.user || {}
        let r_id = req.query.r_id

        if (!r_id) {
            return res.send({
                result: false,
                message: "Religion details id is required"
            })
        }
        const checkPlan = await model.Checkreligion(r_id)

        if (checkPlan.length === 0) {
            return res.send({
                result: false,
                message: "Religion details not found"
            })
        }

        const deleted = await model.DeleteReligion(r_id)
        if (deleted.affectedRows > 0) {

            return res.send({
                result: true,
                message: "Religion details deleted successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to delete Religion details"
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.DeleteCommunity = async (req, res) => {
    try {
        const { user_id } = req.user || {}
        let cm_id = req.query.cm_id

        if (!cm_id) {
            return res.send({
                result: false,
                message: "Community details id is required"
            })
        }
        const checkPlan = await model.CheckCommunity(cm_id)
        if (checkPlan.length === 0) {
            return res.send({
                result: false,
                message: "Community details not found"
            })
        }
        const deleted = await model.DeleteCommunity(cm_id)
        if (deleted.affectedRows > 0) {
            return res.send({
                result: true,
                message: "Community details deleted successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to delete Community details"
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}