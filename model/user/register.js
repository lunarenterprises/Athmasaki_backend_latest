var db = require('../../config/db');
var util = require("util");
const query = util.promisify(db.query).bind(db);
const getConnection = util.promisify(db.getConnection).bind(db);

module.exports.ListAllUsers = async (user_id, condition, params = []) => {
    const Query = `SELECT * FROM users 
                   WHERE u_role='user' 
                   AND u_status='active' 
                   AND u_id != ? 
                   AND u_id NOT IN (
            SELECT 
                CASE 
                    WHEN i_sender_id = ? THEN i_receiver_id
                    WHEN i_receiver_id = ? THEN i_sender_id
                END
            FROM interests
            WHERE i_sender_id = ? OR i_receiver_id = ?
        )
                   ${condition} `;
    console.log("Query", Query);

    return await query(Query, [
        user_id,
        user_id,        // CASE sender
        user_id,        // CASE receiver
        user_id,        // WHERE sender
        user_id,
        ...params
    ]);
};

module.exports.GetprofileImage = async (u_id) => {
    let Query = `select * from user_images where ui_u_id=?`
    return await query(Query, [u_id])
}

module.exports.CheckPreference = async (user_id) => {
    let Query = `select * from partner_preference where pp_user_id=?`
    return await query(Query, [user_id])
}
module.exports.GetUserSubscriptionData = async (user_id) => {
    let Query = `select * from subscriptions where s_user_id=?`
    return await query(Query, [user_id])
}

module.exports.CheckjwtToken = async (token, user_id) => {
    const Query = `SELECT ut_token FROM user_token 
                   WHERE ut_u_id = ? AND ut_token = ? 
                   LIMIT 1`;
    return await query(Query, [user_id, token]);
};


module.exports.CheckMobile = async (mobile) => {
    let Query = `select * from users where u_mobile=?`
    return await query(Query, [mobile])
}

module.exports.CheckEditMobile = async (mobile, u_id) => {
    const Query = ` SELECT * FROM users WHERE u_mobile = ? AND u_id != ? `;
    return await query(Query, [mobile, u_id]);
};

module.exports.CheckEmail = async (u_email) => {
    let Query = `select * from users where u_email=?`
    return await query(Query, [u_email])
}

module.exports.checkIfExists = async () => {
    var Query = `SELECT u_profile_id FROM users order by u_id desc limit 1`;
    var data = await query(Query);
    return data;
};

module.exports.RegisterUser = async (profile_id, mobile, token, tokenExpiryTime) => {
    let Query = `insert into users (u_profile_id,u_mobile,u_token,u_token_expiry) values(?,?,?,?)`
    return await query(Query, [profile_id, mobile, token, tokenExpiryTime])
}

module.exports.DeletePhone = async (u_id) => {
    let Query = `delete from users where u_id=?`
    return await query(Query, [u_id])
}

module.exports.getPlan = async () => {
    let Query = `select * from plans where p_id='1'`
    return await query(Query)
}

module.exports.CheckUserWithId = async (user_id) => {
    let Query = `select * from users where u_id=?`
    return await query(Query, [user_id])
}

module.exports.CheckFiledVisible = async (userId) => {
    const sql = `
    SELECT dv_field_name, dv_is_visible
    FROM user_details_visibility
    WHERE dv_user_id = ?
  `;

    const rows = await query(sql, [userId]);

    const visibility = {};

    rows.forEach(row => {
        visibility[row.dv_field_name] = (row.dv_is_visible);
    });

    return visibility;
};


module.exports.AddSubscription = async (user_id, p_id, p_name, p_interest_limit, p_monthly_interest, p_duration, start_date, end_date) => {
    let Query = `insert into subscriptions (s_user_id,s_plan_id,s_plan_name,s_interest_limit,s_monthly_limit,s_duration,s_start_date,s_end_date) values(?,?,?,?,?,?,?,?)`
    return await query(Query, [user_id, p_id, p_name, p_interest_limit, p_monthly_interest, p_duration, start_date, end_date])
}

module.exports.CheckImages = async (user_id) => {
    let Query = `select * from user_images where ui_u_id=?`
    return await query(Query, [user_id])
}

module.exports.DeleteUserImage = async (user_id, image_id) => {
    var Query = `delete from user_images where ui_u_id=? and ui_id =?`;
    var data = await query(Query, [user_id, image_id]);
    return data;
}

module.exports.DeleteAllUserFilesQuery = async (u_id) => {
    var Query = `delete from user_images where ui_u_id=? `;
    var data = await query(Query, [u_id]);
    return data;
}

module.exports.AddimageQuery = async (u_id, imagePath) => {
    var Query = `insert into user_images (ui_u_id,ui_file) values(?,?)`;
    var data = await query(Query, [u_id, imagePath]);
    return data;
}

module.exports.UpdateUserProfile = async (updateString, values, user_id) => {
    const Query = `UPDATE users SET ${updateString} WHERE u_id = ?`;
    return await query(Query, [...values, user_id]); // ✅ Pass all values safely
};

module.exports.UpdateToken = async (verify, mobile, token, token_expiry) => {
    let Query = `update users set u_mobile_verify =?,u_token=?, u_token_expiry=? where u_mobile=?`
    return await query(Query, [verify, token, token_expiry, mobile])
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

module.exports.ListUserQuery = async (user_id) => {
    var Query = `SELECT * FROM users where u_id=? `;
    var data = query(Query, [user_id]);
    return data;
};

module.exports.GetUserVisibilityData = async (user_id) => {
    var Query = `SELECT * FROM user_details_visibility where dv_user_id=? `;
    var data = query(Query, [user_id]);
    return data;
};

module.exports.DeleteUser = async (user_id) => {
    const connection = await getConnection(); // ✅ properly await connection
    const transQuery = util.promisify(connection.query).bind(connection);

    try {
        // Begin transaction
        await transQuery('START TRANSACTION');
        // Delete from related tables first
        await transQuery(`DELETE FROM login_data WHERE ld_u_id = ?`, [user_id]);
        await transQuery(`DELETE FROM matches WHERE m_user_id = ? OR m_matched_user_id = ?`, [user_id, user_id]);
        await transQuery(`DELETE FROM interests WHERE i_sender_id = ? OR i_receiver_id = ?`, [user_id, user_id]);
        await transQuery(`DELETE FROM notification WHERE n_sender_id = ? OR n_receiver_id = ?`, [user_id, user_id]);
        await transQuery(`DELETE FROM partner_preference WHERE pp_user_id = ?`, [user_id]);
        await transQuery(`DELETE FROM profile_visit WHERE pv_visiter_id = ? OR pv_profile_id = ?`, [user_id, user_id]);
        await transQuery(`DELETE FROM user_images WHERE ui_u_id = ?`, [user_id]);
        await transQuery(`DELETE FROM user_details_visibility WHERE dv_user_id = ?`, [user_id]);

        // Finally, delete user record
        await transQuery(`DELETE FROM users WHERE u_id = ?`, [user_id]);

        // Commit transaction
        await transQuery('COMMIT');

        console.log(`✅ Deleted user ${user_id} and all related data.`);
        connection.release(); // ✅ release connection back to pool
        return true;
    } catch (error) {
        // Rollback on failure
        await transQuery('ROLLBACK');
        connection.release();
        console.error(`❌ Failed to delete user ${user_id}:`, error);
        throw error;
    }
};

module.exports.ResumbitProfile = async (user_id) => {
    let Query = `UPDATE users SET u_status ='pending' WHERE u_id=?`;
    return await query(Query, [user_id]);
};


module.exports.LoginData = async (u_id, datetime) => {
    let Query = ` insert into login_data (ld_u_id,ld_login_time) values(?,?)`;
    return await query(Query, [u_id, datetime])
}

module.exports.UpdateLoginData = async (u_id, datetime) => {
    let Query = `update login_data set ld_login_time=? where ld_u_id=?`
    return await query(Query, [datetime, u_id])
}

module.exports.CheckLoginData = async (u_id) => {
    let Query = ` SELECT * FROM login_data WHERE ld_u_id = ?`;
    return await query(Query, [u_id])
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



module.exports.CheckTermsAndCondition = async (u_id) => {
    let Query = ` SELECT * FROM userAcceptTermsPolicy WHERE accepttermspolicy_user_id = ?`;
    return await query(Query, [u_id])
}

module.exports.AddTermsAndCondition = async (u_id, datetime) => {
    let Query = ` insert into userAcceptTermsPolicy (accepttermspolicy_user_id,accepttermspolicy_date) values(?,?)`;
    return await query(Query, [u_id, datetime])
}

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