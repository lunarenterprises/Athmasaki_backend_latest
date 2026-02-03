var db = require('../../config/db');
var util = require("util");
const query = util.promisify(db.query).bind(db);
// const getConnection = util.promisify(db.getConnection).bind(db); 

module.exports.UpdateMobile = async (mobile, user_id) => {
  const Query = `UPDATE users SET u_mobile=? WHERE u_id = ?`;
  return await query(Query, [mobile, user_id]); 
};

module.exports.UpdateToken = async (user_id, token, token_expiry) => {
    const Query = `update users set u_token=?, u_token_expiry=? where u_id=?`
    return await query(Query, [token, token_expiry, user_id])
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

module.exports.BlockUserFor3Hours = async (threehour,user_id) => {
  const Query = `UPDATE users SET u_otp_block_until = ? WHERE u_id = ?`;
  return await query(Query, [threehour,user_id]);
};

module.exports.ResetOtpAttempts = async (user_id) => {
    const Query = `update users set u_otp_attempt = 0, u_otp_block_until = ? where u_id=?`
    return await query(Query, [null,user_id])
}

module.exports.CheckEditMobile = async (mobile, u_id) => {
    const Query = ` SELECT * FROM users WHERE u_mobile = ? AND u_id != ? `;
    return await query(Query, [mobile, u_id]);
};

module.exports.CheckUser = async (user_id) => {
    const Query = `select * from users where u_id=?`
    return await query(Query, [user_id])
}

module.exports.DeletePhone = async (u_id) => {
    const Query = `delete from users where u_id=?`
    return await query(Query, [u_id])
}
