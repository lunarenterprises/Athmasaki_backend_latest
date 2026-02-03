var db = require('../../config/db');
var util = require("util");
const query = util.promisify(db.query).bind(db);

module.exports.CheckMobile = async (ad_mobile) => {
    let Query = `select * from admins where ad_mobile=?`
    return await query(Query, [ad_mobile])
}

module.exports.CheckEmail = async (ad_email) => {
    let Query = `select * from admins where ad_email=?`
    return await query(Query, [ad_email])
}

module.exports.checkIfExists = async () => {
    var Query = `SELECT ad_profile_id FROM admins order by ad_id desc limit 1`;
    var data = await query(Query);
    return data;
};

module.exports.AddAdmin = async (profile_id, ad_name, ad_email,ad_mobile, password) => {
    let Query = `insert into admins (ad_profile_id,ad_name,ad_email,ad_mobile,ad_password) values(?,?,?,?,?)`
    return await query(Query, [profile_id, ad_name, ad_email,ad_mobile, password])
}

module.exports.AddPermission = async (admin_id, permissions) => {
    let Query = `insert into admin_permissions (adp_admin_id,adp_permission) values(?,?)`
    return await query(Query, [admin_id, permissions])
}

module.exports.ListAdmin = async (condition) => {
    let Query = `select * from admins ${condition}`
    return await query(Query)
}

module.exports.listPermissions = async (admin_id) => {
    let Query = `select * from admin_permissions where adp_admin_id =?`
    return await query(Query, [admin_id])
}

module.exports.CheckAdmin = async (ad_id) => {
    let Query = `select * from admins where ad_id=?`
    return await query(Query, [ad_id])
}

module.exports.UpdateAdmin = async (updateQuery, params) => {
    const Query = `UPDATE admins SET ${updateQuery} WHERE ad_id = ?`;
    return await query(Query, params); 
};


module.exports.DeleteAdmin = async (ad_id) => {
    let Query = `delete from admins where ad_id=?`
    return await query(Query, [ad_id])
}

module.exports.DeletePermissionsByAdmin = async (admin_id) => {
    let Query = `delete from admin_permissions where adp_admin_id=?`
    return await query(Query, [admin_id])
}
