var db = require('../../config/db');
var util = require("util");
const query = util.promisify(db.query).bind(db);

module.exports.AddAdminJWTToken = async (token, user_id) => {
    let Query = `insert into user_token (ut_admin_id,ut_token) values (?,?)`
    return await query(Query, [user_id, token])
}

module.exports.CheckToken = async (token, user_id) => {
    let Query = `select * from user_token where ut_admin_id =? and ut_token=?`
    return await query(Query, [token, user_id])
}

module.exports.LoginWithMobileOrEmail = async (emailOrMobile) => {
    let Query = ` SELECT * FROM admins WHERE ad_email = ?`;
    return await query(Query, [emailOrMobile])
}

module.exports.CheckUserWithId = async (admin_id) => {
    let Query = ` SELECT * FROM admins WHERE ad_id = ?`;
    return await query(Query, [admin_id])
}

module.exports.CheckJWTToken = async (user_id) => {
    let Query = `select * from user_token where ut_admin_id =?`
    return await query(Query, [user_id])
}

module.exports.AdminPermission = async (admin_id) => {
    let Query = ` SELECT * FROM admin_permissions WHERE adp_admin_id = ?`;
    return await query(Query, [admin_id])
}


module.exports.CheckJwtToken = async (token, user_id) => {
    let Query = `select * from user_token where ut_admin_id =?`
    return await query(Query, [token, user_id])
}

module.exports.AddUserJWTToken = async (token, user_id) => {
    let Query = `insert into user_token (ut_admin_id,ut_token) values (?,?)`
    return await query(Query, [user_id, token])
}

module.exports.UpdateAdminToken = async (token, user_id) => {
    let Query = `update user_token set ut_token=? where ut_admin_id =?`
    return await query(Query, [token, user_id])
}