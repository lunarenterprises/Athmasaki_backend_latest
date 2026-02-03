var db = require('../../config/db');
var util = require("util");
const query = util.promisify(db.query).bind(db);

module.exports.CheckUserWithId = async (user_id) => {
    let sql = `SELECT * FROM users WHERE u_id = ?`;
    return await query(sql, [user_id]);
};

module.exports.UpdateUserProfile = async (selfieUrl, user_id) => {
    let sql = `UPDATE users SET u_selfi_image = ?,u_verify_profile ='pending' WHERE u_id = ?`;
    return await query(sql, [selfieUrl, user_id]);
}

module.exports.VerifyUserProfileApprove = async (user_id, status) => {
    const sql = `UPDATE users SET u_verify_profile=? WHERE u_id = ?`;
    return await query(sql, [status, user_id]);
}

 