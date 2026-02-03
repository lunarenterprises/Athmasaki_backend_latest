var db = require('../../config/db');
var util = require("util");
const query = util.promisify(db.query).bind(db);

module.exports.CheckJwtToken = async (token, user_id) => {
    let Query = `select * from user_token where ut_u_id =?`
    return await query(Query, [token, user_id])
}

module.exports.AddUserJWTToken = async (token, user_id) => {
    let Query = `insert into user_token (ut_u_id,ut_token) values (?,?)`
    return await query(Query, [user_id, token])
}

module.exports.UpdateUserJWTToken = async (token, user_id) => {
    let Query = `update user_token set ut_token=? where ut_u_id =?`
    return await query(Query, [token, user_id])
}

module.exports.UpdateAdminJwtToken = async (token, user_id) => {
    let Query = `update user_token set ut_token=? where ut_admin_id =?`
    return await query(Query, [token, user_id])
}

module.exports.UpdateToken = async (mobile, token, token_expiry) => {
    let Query = `update users set u_token=?, u_token_expiry=? where u_mobile=?`
    return await query(Query, [token, token_expiry, mobile])
}

module.exports.GetOtpAttempts = async (user_id) => {
    const Query = `SELECT u_otp_attempt FROM users WHERE u_id = ?`;
    let rows = await query(Query, [user_id]);
    return rows[0]?.u_otp_attempt || 0;
};

module.exports.IncreaseOtpAttempts = async (user_id) => {
    const Query = `UPDATE users SET u_otp_attempt = u_otp_attempt + 1 WHERE u_id = ?`;
    return await query(Query, [user_id]);
};

module.exports.BlockUserFor3Hours = async (threehour, user_id) => {
    const Query = `UPDATE users SET u_otp_block_until = ? WHERE u_id = ?`;
    return await query(Query, [threehour, user_id]);
};

module.exports.ResetOtpAttempts = async (user_id) => {
    const Query = `update users set u_otp_attempt = 0, u_otp_block_until = ? where u_id=?`
    return await query(Query, [null, user_id])
}

module.exports.LoginWithMobileOrEmail = async (emailOrMobile) => {
    let Query = ` SELECT * FROM users WHERE u_email = ? OR u_mobile = ?`;
    return await query(Query, [emailOrMobile, emailOrMobile])
}

module.exports.CheckEmail = async (email) => {
    let Query = ` SELECT * FROM users WHERE u_email = ? OR u_mobile = ?`;
    return await query(Query, [email, email])
}

module.exports.CheckMobile = async (mobile) => {
    let Query = `select * from users where u_mobile=?`
    return await query(Query, [mobile])
}

module.exports.CheckLoginData = async (u_id) => {
    let Query = ` SELECT * FROM login_data WHERE ld_u_id = ?`;
    return await query(Query, [u_id])
}

module.exports.LoginData = async (u_id, datetime) => {
    let Query = ` insert into login_data (ld_u_id,ld_login_time) values(?,?)`;
    return await query(Query, [u_id, datetime])
}

module.exports.UpdateLoginData = async (u_id, datetime) => {
    let Query = `update login_data set ld_login_time=? where ld_u_id=?`
    return await query(Query, [datetime, u_id])
}

module.exports.CheckUserLogin = async (user_ref_id) => {
    var Query = `select * from fcm_tokens where ft_u_id = ?`;
    var data = query(Query, [user_ref_id]);
    return data;
};

module.exports.UpdateUserToken = async (u_id, fcm_token) => {
    var Query = `update fcm_tokens set ft_fcm_token =? where ft_u_id = ?`;
    var data = query(Query, [fcm_token, u_id]);
    return data;
};

module.exports.AddUserToken = async (u_id, fcm_token) => {
    var Query = `insert into fcm_tokens (ft_u_id,ft_fcm_token) values (?,?)`;
    var data = query(Query, [u_id, fcm_token]);
    return data;
};

module.exports.ActivateUSer = async (u_id) => {
    let Query = `update users set u_status='active' where u_id=?`
    return await query(Query, [u_id])
}