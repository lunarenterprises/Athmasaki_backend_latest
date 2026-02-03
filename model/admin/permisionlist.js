var db = require('../../config/db');
var util = require("util");
const query = util.promisify(db.query).bind(db);

module.exports.CreatePermission = async (name) => {
    let Query = `insert into permissions (pm_name) values(?)`
    return await query(Query, [name])
}

module.exports.ListPermission = async () => {
    let Query = `select * from permissions`
    return await query(Query)
}

module.exports.CheckPermision = async (plan_id) => {
    let Query = `select * from permissions where pm_id=?`
    return await query(Query, [plan_id])
}

module.exports.UpdatePermision = async (condition, plan_id) => {
    let Query = `update permissions set ${condition} where pm_id=?`
    return await query(Query, [plan_id])
}

module.exports.DeletePermision = async (plan_id) => {
    let Query = `delete from permissions where pm_id=?`
    return await query(Query, [plan_id])
}


module.exports.getAdminPermissions = async (adminId) => {
    let Query = `select * from admin_permissions where adp_admin_id=?`
    return await query(Query, [adminId])
}
