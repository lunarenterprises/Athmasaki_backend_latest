var db = require('../../config/db');
var util = require("util");
const query = util.promisify(db.query).bind(db);
const getConnection = util.promisify(db.getConnection).bind(db); // ✅ promisify pool.getConnection()

// ✅ 1. Get all users’ last login and inactivity duration
module.exports.CheckInactivity = async () => {
    const sql = `
        SELECT 
            ld_u_id AS user_id,
            MAX(ld_login_time) AS last_login,
            DATEDIFF(NOW(), MAX(ld_login_time)) AS days_since_last_login
        FROM 
            login_data 
        GROUP BY 
            ld_u_id 
        ORDER BY 
            days_since_last_login DESC `;
    return await query(sql);
};

// ✅ 2. Deactivate user after 9 months of inactivity
module.exports.DeactivateUser = async (user_id) => {
    const sql = `UPDATE users SET u_status = 'inactive' WHERE u_id = ?`;
    return await query(sql, [user_id]);
};

module.exports.DeactivateUserMatch = async (user_id) => {
    const sql = `UPDATE matches SET m_status = '0' WHERE m_user_id = ? OR m_matched_user_id = ?`;
    return await query(sql, [user_id, user_id]);
};

// ✅ 3. Delete user permanently after 12 months of inactivity
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

module.exports.CheckPlanExpiry = async () => {
    const sql = `SELECT * FROM subscriptions WHERE s_end_date < NOW() or s_interest_limit = 0`;
    return await query(sql);
};

module.exports.UpdateUserStatusInactive = async (user_id) => {
    const sql = `UPDATE subscriptions SET s_status = 'inactive' WHERE s_user_id = ?`;
    // console.log("user id in model:", user_id);
    return await query(sql, [user_id]);
}
