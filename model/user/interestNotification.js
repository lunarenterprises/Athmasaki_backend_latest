var db = require('../../config/db');
var util = require("util");
const query = util.promisify(db.query).bind(db);

/**
 * Create a new interest notification
 * Note: is_notification_read starts as TRUE (1) and becomes FALSE (0) when user views it
 */
module.exports.createInterestNotification = async (from_user_id, to_user_id, type) => {
    const Query = `INSERT INTO interest_notifications 
                   (in_from_user_id, in_to_user_id, in_type, in_is_notification_read, in_created_at) 
                   VALUES (?, ?, ?, TRUE, NOW())`;
    return await query(Query, [from_user_id, to_user_id, type]);
};

/**
 * Mark an interest notification as read
 * Sets is_notification_read to FALSE when user clicks/views the notification
 */
module.exports.markInterestNotificationAsRead = async (notification_id, user_id) => {
    const Query = `UPDATE interest_notifications 
                   SET in_is_notification_read = FALSE 
                   WHERE in_id = ? AND in_to_user_id = ?`;
    return await query(Query, [notification_id, user_id]);
};

/**
 * Get count of unread interest notifications for a user
 * Unread means is_notification_read = TRUE (not yet viewed)
 */
module.exports.getUnreadInterestCount = async (user_id) => {
    const Query = `SELECT COUNT(*) as count 
                   FROM interest_notifications 
                   WHERE in_to_user_id = ? AND in_is_notification_read = TRUE`;
    const result = await query(Query, [user_id]);
    return result[0]?.count || 0;
};

/**
 * Get user details for notification payload (firstname, lastname, profile image)
 */
module.exports.getUserDetailsForNotification = async (user_id) => {
    const Query = `SELECT 
                        u.u_first_name, 
                        u.u_last_name,
                        (SELECT ui.ui_file 
                         FROM user_images ui 
                         WHERE ui.ui_u_id = u.u_id AND ui.ui_visibility_status = 0 
                         ORDER BY ui.ui_id ASC 
                         LIMIT 1) as profile_image
                   FROM users u 
                   WHERE u.u_id = ?`;
    const result = await query(Query, [user_id]);
    return result[0] || null;
};

/**
 * Get interest notification by ID
 */
module.exports.getInterestNotificationById = async (notification_id) => {
    const Query = `SELECT * FROM interest_notifications WHERE in_id = ?`;
    const result = await query(Query, [notification_id]);
    return result[0] || null;
};

/**
 * Get all interest notifications for a user (for listing)
 */
module.exports.getInterestNotificationsForUser = async (user_id, limit = 50) => {
    const Query = `SELECT 
                        n.*,
                        u.u_first_name as from_user_firstname,
                        u.u_last_name as from_user_lastname,
                        (SELECT ui.ui_file 
                         FROM user_images ui 
                         WHERE ui.ui_u_id = u.u_id AND ui.ui_visibility_status = 0 
                         ORDER BY ui.ui_id ASC 
                         LIMIT 1) as from_user_image
                   FROM interest_notifications n
                   JOIN users u ON u.u_id = n.in_from_user_id
                   WHERE n.in_to_user_id = ?
                   ORDER BY n.in_created_at DESC
                   LIMIT ?`;
    return await query(Query, [user_id, limit]);
};
