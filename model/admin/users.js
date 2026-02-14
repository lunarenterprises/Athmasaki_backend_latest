var db = require('../../config/db');
var util = require("util");
const query = util.promisify(db.query).bind(db);


// module.exports.ListAllUsers = async (condition = "", params = []) => {
//     const Query = `
//         SELECT * 
//         FROM users 
//         WHERE u_role='user' 
//         ${condition} 
//         ORDER BY u_id DESC
//     `;
//     return await query(Query, params);  // ✅ pass params
// };
module.exports.ListAllUsers = async (condition = "", params = []) => {
    const Query = `
        SELECT 
            u.*,
            GROUP_CONCAT(ui.ui_file) AS images
        FROM users u
        LEFT JOIN user_images ui 
            ON ui.ui_u_id = u.u_id
        WHERE u.u_role = 'user'
        ${condition}
        GROUP BY u.u_id
        ORDER BY u.u_id DESC
    `;
    return await query(Query, params);
};


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