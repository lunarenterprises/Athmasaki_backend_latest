var db = require('../../config/db');
var util = require("util");
const query = util.promisify(db.query).bind(db);

module.exports.ListAllUsers = async (condition) => {
    const Query = `select * from users where u_role='user' ${condition} order by u_id desc `
    return await query(Query)
}

module.exports.CheckUser = async (user_id) => {
    let Query = `select * from users where u_id=?`
    return await query(Query, [user_id])
}

module.exports.UpdateStatus = async (user_id, status, reason) => {
    let Query = `update users set u_status=?,u_reject_reason =? where u_id=?`
    return await query(Query, [status, reason, user_id])
}

module.exports.GetUserSubscriptionData = async (user_id) => {
    let Query = `select * from subscriptions where s_user_id=?`
    return await query(Query, [user_id])
}

module.exports.GetprofileImage = async (u_id) => {
    let Query = `select * from user_images where ui_u_id=?`
    return await query(Query, [u_id])
}