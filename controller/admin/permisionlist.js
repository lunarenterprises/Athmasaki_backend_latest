const model = require('../../model/admin/permisionlist')

// module.exports.CreatePermission = async (req, res) => {
//     try {

//         const { name} = req.body

//         if (!name ) {
//             return res.send({
//                 result: false,
//                 message: "permision name is required"
//             })
//         }

//         const created = await model.CreatePermission(name)

//         if (created.affectedRows > 0) {
//             return res.send({
//                 result: true,
//                 message: "Permission created successfully"
//             })
//         } else {
//             return res.send({
//                 result: false,
//                 message: "Failed to create Permission. Please try again later."
//             })
//         }
//     } catch (error) {
//         return res.send({
//             result: false,
//             message: error.message
//         })
//     }
// }

module.exports.ListPermissions = async (req, res) => {
    try {

        const planData = await model.ListPermission()
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

// module.exports.EditPermission = async (req, res) => {
//     try {
//         const { user_id } = req.user || {}
//         const { permision_id, name} = req.body
//         if (!permision_id) {
//             return res.send({
//                 result: false,
//                 message: "permision id is required"
//             })
//         }

//         const checkPlan = await model.CheckPermision(permision_id)
//         if (checkPlan.length === 0) {
//             return res.send({
//                 result: false,
//                 message: "permision data not found."
//             })
//         }

//         let updates = []
//         if (name !== undefined) updates.push(`pm_name = '${name}'`)

//         if (updates.length > 0) {
//             const updateString = updates.join(', ');
//             const updated = await model.UpdatePermision(updateString, permision_id)
//             if (updated.affectedRows === 0) {
//                 return res.send({
//                     result: false,
//                     message: "Failed to update permision"
//                 })
//             }
//         }

//         return res.send({
//             result: true,
//             message: "Permision updated successfully"
//         })
//     } catch (error) {
//         return res.send({
//             result: false,
//             message: error.message
//         })
//     }
// }

// module.exports.DeletePermission = async (req, res) => {
//     try {
//         const { user_id } = req.user || {}

//         const { permision_id } = req.body
//         if (!permision_id) {
//             return res.send({
//                 result: false,
//                 message: "permision id is required"
//             })
//         }
//         const checkPlan = await model.CheckPermision(permision_id)
//         if (checkPlan.length === 0) {
//             return res.send({
//                 result: false,
//                 message: "permision data not found"
//             })
//         }

//         const deleted = await model.DeletePermision(permision_id)
//         if (deleted.affectedRows > 0) {
//             return res.send({
//                 result: true,
//                 message: " permision deleted successfully"
//             })
//         } else {
//             return res.send({
//                 result: false,
//                 message: "Failed to delete permision"
//             })
//         }
//     } catch (error) {
//         return res.send({
//             result: false,
//             message: error.message
//         })
//     }
// }


