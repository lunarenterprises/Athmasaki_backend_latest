const db = require('../../config/db');
const util = require('util');
const query = util.promisify(db.query).bind(db);

// Total Revenue
module.exports.TotalRevenue = async () => {
    const result = await query(`
        SELECT SUM(ph_amount) AS total FROM paymentHistory WHERE ph_status IN ('Paid', 'success') `);
    return result[0].total || 0;
};

module.exports.RevenueByPlanType = async () => {
    const result = await query(`SELECT 
            p.p_name AS plan,
            COALESCE(SUM(ph.ph_amount), 0) AS revenue
        FROM plans p
        LEFT JOIN paymentHistory ph ON ph.ph_plan_id = p.p_id
        WHERE p.p_plan_type IN ('payperuse', 'subscription') and ph.ph_status IN ('Paid', 'success')
        GROUP BY p.p_id
        ORDER BY revenue DESC `);
    return result;
};

// Monthly Revenue (for chart)
module.exports.MonthlyRevenue = async () => {
    const result = await query(`
        SELECT 
            MONTHNAME(ph_createdat) AS month,
            SUM(ph_amount) AS revenue
        FROM paymentHistory
        GROUP BY MONTH(ph_createdat)
        ORDER BY MONTH(ph_createdat) `);
    return result;
};
