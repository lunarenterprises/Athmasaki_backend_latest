var db = require('../config/db');
var util = require("util");
const query = util.promisify(db.query).bind(db);


module.exports = async (req, res, next) => {
    try {
        await query(`
      UPDATE subscriptions
      SET s_status = 'expired'
      WHERE s_end_date < CURDATE()
        AND s_status = 'active'
    `);
    } catch (err) {
        console.error("❌ Failed to update subscriptions:", err);
    }
    next(); // continue to your actual API
};