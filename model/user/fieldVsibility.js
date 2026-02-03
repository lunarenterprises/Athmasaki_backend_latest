
var db = require('../../config/db');
var util = require("util");
const query = util.promisify(db.query).bind(db);

module.exports.Checkvisibility = async (user_id, field_name) => {
  let Query = `SELECT * FROM user_details_visibility WHERE dv_user_id = ? AND dv_field_name = ?`
  return await query(Query, [user_id, field_name])
}

module.exports.InsertVisibility = async (user_id, field_name, is_visible) => {
  let Query = `INSERT INTO user_details_visibility (dv_user_id, dv_field_name, dv_is_visible) VALUES (?, ?, ?)`;
  return await query(Query, [user_id, field_name, is_visible])
}

module.exports.UpdateVisibility = async (user_id, field_name, is_visible) => {
  let Query = `UPDATE user_details_visibility SET dv_is_visible = ? WHERE dv_user_id = ? AND dv_field_name = ?`;
  return await query(Query, [is_visible, user_id, field_name])
}

module.exports.CheckImage = async (image_id, ui_u_id) => {
  let Query = `SELECT * FROM user_images WHERE ui_id = ? and ui_u_id=?`
  return await query(Query, [image_id, ui_u_id])
}

module.exports.UpdateImageVisibility = async (image_id, is_visible) => {
  let Query = `UPDATE user_images SET ui_visibility_status = ? WHERE ui_id = ?`;
  return await query(Query, [is_visible, image_id])
}

module.exports.getVisibilitySettings = async () => {
  const Query = ` SELECT dv_user_id, dv_field_name, dv_is_visible FROM user_details_visibility `;
  const rows = await query(Query);

  const settings = {};
  rows.forEach(row => {
    // group by user_id
    if (!settings[row.dv_user_id]) {
      settings[row.dv_user_id] = {};
    }

    // map field_name -> is_visible
    settings[row.dv_user_id][row.dv_field_name] = row.dv_is_visible;
  });

  // console.log("settings", settings);
  return settings;
};

module.exports.getInterestStatus = async (userA, userB) => {
  const Query = `SELECT i_status FROM interests 
     WHERE (i_sender_id = ? AND i_receiver_id = ?)
        OR (i_sender_id = ? AND i_receiver_id = ?) LIMIT 1`;

  const rows = await query(Query, [userA, userB, userB, userA]);
  return rows.length ? rows[0].i_status : null;
}

module.exports.CheckBlock = async (sender_id, reciever_id) => {
  let Query = `select * from blocked_users where (bu_sender_id=? and bu_blocked_id=?) or (bu_sender_id=? and bu_blocked_id=?)`
  return await query(Query, [sender_id, reciever_id, reciever_id, sender_id])
}

module.exports.CheckDislike = async (sender_id, reciever_id) => {
  let Query = `select * from matches where (m_user_id=? and m_matched_user_id=? and m_dislike =1) or (m_user_id=? and m_matched_user_id=? and m_dislike =1)`
  return await query(Query, [sender_id, reciever_id, reciever_id, sender_id])
}

module.exports.CheckPlan = async (currentUserId) => {
  let Query = `SELECT u_plan FROM users WHERE u_id = ?`
  return await query(Query, [currentUserId])
}

module.exports.GetPlanDetails = async (plan_id) => {
  let Query = `SELECT * FROM plans WHERE p_id = ?`
  return await query(Query, [plan_id])
}

module.exports.CheckPayPerUser = async (viewerId, targetUserId) => {
  let Query = `
    SELECT * 
    FROM payperuser 
    WHERE pu_viewer_id = ? 
      AND pu_target_user_id = ? 
      AND pu_status = 'paid' `
  return await query(Query, [viewerId, targetUserId]);
};

