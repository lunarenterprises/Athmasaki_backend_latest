const db = require('../../config/db'); // DB connection
const util = require('util');
const query = util.promisify(db.query).bind(db);

// ✅ Active users (logged in within the last 30 days)
module.exports.ActiveUsers = async () => {
    const result = await query(`
        SELECT COUNT(DISTINCT u.u_id) AS count
        FROM users u
        INNER JOIN login_data ld ON ld.ld_u_id = u.u_id
        WHERE ld.ld_login_time >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        AND u.u_status = 'active'
    `);

    return result[0].count;
};


module.exports.InActiveUsers = async () => {
    const result = await query(`
        SELECT COUNT(*) AS count
        FROM users u
        WHERE u.u_status = 'inactive'
        AND u.u_id NOT IN (
            SELECT ld.ld_u_id
            FROM login_data ld
            WHERE ld.ld_login_time >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) ) `);

    return result[0].count;
};


// ✅ Users who registered today
module.exports.NewRegistrations = async () => {
    const result = await query(`
        SELECT COUNT(*) AS count 
        FROM users 
        WHERE DATE(u_createdAt) = CURDATE() `);
    return result[0].count;
};

// ✅ Users reported today
module.exports.ReportedUsers = async () => {
    const result = await query(`
        SELECT COUNT(*) AS count 
        FROM blocked_users `);
    return result[0].count;
};

// ✅ List of pending approvals created today
module.exports.PendingApprovalsList = async () => {
    const result = await query(`
        SELECT *
        FROM users
        WHERE u_status = 'pending'`);
    return result;
};

// ✅ Inactive users (not logged in during last 30 days or never logged in)

module.exports.InactiveUsersList = async (days) => {
    const sql = `
        SELECT 
            u.u_id,
            u.u_first_name,
            u.u_last_name,
            u.u_gender,
            u.u_email,
            u.u_mobile,
            ld.ld_id,
            ld.ld_login_time,
            ui.ui_id,
            ui.ui_file,
            ui.ui_visibility_status
        FROM users u
        INNER JOIN login_data ld 
            ON ld.ld_u_id = u.u_id
        LEFT JOIN user_images ui 
            ON ui.ui_id = (
                SELECT ui2.ui_id
                FROM user_images ui2
                WHERE ui2.ui_u_id = u.u_id
                ORDER BY ui2.ui_id DESC
                LIMIT 1
            )
        WHERE ld.ld_login_time < DATE_SUB(CURDATE(), INTERVAL ? DAY)
        ORDER BY ld.ld_login_time ASC
    `;

    return query(sql, [days]);
};

