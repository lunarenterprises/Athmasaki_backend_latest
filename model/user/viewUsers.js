var db = require('../../config/db');
var util = require("util");
const query = util.promisify(db.query).bind(db);

module.exports.ListAllUsers = async (user_id) => {
    const Query = `select * from users where u_id =? and u_role='user' and u_status='active'`
    return await query(Query,[user_id])
}

module.exports.GetAllUsers = async () => {
    const Query = `select * from users where u_role='user' and u_status='active'`
    return await query(Query)
}

module.exports.ViewUsers = async (user_id) => {
    const Query = `select u.*,s.s_plan_id,s.s_plan_name from users u left join subscriptions s on  u.u_id = s.s_user_id where u.u_id =? and u.u_role='user' `
    return await query(Query,[user_id])
}

module.exports.GetUserVisibilityData = async (user_id) => {
    var Query = `SELECT * FROM user_details_visibility where dv_user_id=? `;
    var data = query(Query, [user_id]);
    return data;
};

module.exports.CheckUser = async (user_id) => {
    let Query = `select * from users where u_id=?`
    return await query(Query, [user_id])
}

module.exports.UpdateStatus = async (user_id, status) => {
    let Query = `update users set u_status=? where u_id=?`
    return await query(Query, [status, user_id])
}

module.exports.GetUserSubscriptionData = async (user_id) => {
    let Query = `select * from subscriptions where s_user_id=?`
    return await query(Query, [user_id])
}

module.exports.GetprofileImage = async (u_id) => {
    let Query = `select * from user_images where ui_u_id=?`
    return await query(Query, [u_id])
}



module.exports.CheckJwtToken= async (user_id) => {
    let Query = `select * from user_token where ut_u_id =?`
    return await query(Query, [user_id])
}

module.exports.AddUserJWTToken = async (token, user_id) => {
    let Query = `insert into user_token (ut_u_id,ut_token) values (?,?)`
    return await query(Query, [user_id, token])
}

module.exports.UpdateUserJWTToken = async (token, user_id) => {
    let Query = `update user_token set ut_token=? where ut_u_id =?`
    return await query(Query, [token, user_id])
}


module.exports.ListUsersLocation = async () => {
    let Query = `
        SELECT DISTINCT u_location 
        FROM users 
        WHERE u_location IS NOT NULL AND u_location != '' `;
    return await query(Query);
}

module.exports.ListUsersWorks = async () => {
    let Query = `
        SELECT DISTINCT u_work 
        FROM users 
        WHERE u_work IS NOT NULL AND u_work != '' `;
    return await query(Query);
}

module.exports.ListUsersQualification = async () => {
    let Query = `
        SELECT DISTINCT u_highest_qualification 
        FROM users 
        WHERE u_highest_qualification IS NOT NULL AND u_highest_qualification != '' `;
    return await query(Query);
}
