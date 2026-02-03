var db = require('../../config/db');
var util = require("util");
const query = util.promisify(db.query).bind(db);

module.exports.GetPartnerPreference = async (user_id) => {
    let Query = `select * from partner_preference where pp_user_id=?`
    return await query(Query, [user_id])
}

// Already matched users
module.exports.GetMatchedUserIds = async (user_id) => {
    return await query("SELECT m_matched_user_id FROM matches WHERE m_user_id = ?", [user_id]);
}

module.exports.GetInterestSentUserIds = async (user_id) => {
    return await query("SELECT i_receiver_id FROM interests WHERE i_sender_id = ?", [user_id]);
}

module.exports.GetAcceptedInterestUserIds = async (user_id) => {
    return await query(
        `SELECT i_sender_id, i_receiver_id
        FROM interests WHERE (i_sender_id = ? OR i_receiver_id = ?) AND i_status = 'accepted' `,
        [user_id, user_id]
    );
};

// Exclude existing matches when fetching
module.exports.GetAllUsersExcept = async (user_id, excludeIds = []) => {
    let sql = "SELECT * FROM users WHERE u_id != ? AND u_role='user' AND u_status='active'";
    let params = [user_id];
    if (excludeIds.length > 0) {
        sql += " AND u_id NOT IN (?)";
        params.push(excludeIds);
    }
    return await query(sql, params);
}

// Save a new match(avoid duplicate data 'IGNORE')
module.exports.SaveMatch = async (user_id, matched_user_id, match_score) => {
    const sql = `
        INSERT INTO matches (m_user_id, m_matched_user_id, m_match_score)
        SELECT ?, ?, ?
        FROM DUAL
        WHERE NOT EXISTS (
            SELECT 1 FROM matches WHERE m_user_id = ? AND m_matched_user_id = ?
        )
    `;
    return await query(sql, [user_id, matched_user_id, match_score, user_id, matched_user_id]);
};


/**
 * Get matches generated today for a specific user
 */

module.exports.GetTodaysMatches = async (user_id) => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`; // format YYYY-MM-DD

    const Query = `
        SELECT 
            m.*,
            u.*
        FROM matches m
        JOIN users u ON m.m_matched_user_id = u.u_id
        WHERE m.m_user_id = ?
        AND DATE(m.m_created_at) = ?
        ORDER BY m.m_match_score DESC
    `;

    return await query(Query, [user_id, todayStr]);
};


module.exports.MatchExists = async (user_id, matched_user_id) => {
    const Query = `
        SELECT 1
        FROM matches
        WHERE m_user_id = ?
          AND m_matched_user_id = ?
        LIMIT 1 `;

    const result = await query(Query, [user_id, matched_user_id]);
    return result.length > 0;
};

module.exports.GetAllMatches = async (user_id) => {
    const Query = ` SELECT 
            m.*,
            u.*
        FROM matches m
        JOIN users u ON m.m_matched_user_id = u.u_id
        WHERE m.m_user_id = ?
        ORDER BY m.m_match_score DESC `;

    return await query(Query, [user_id]);
};


module.exports.GetprofileImage = async (u_id) => {
    let Query = `select * from user_images where ui_u_id=?`
    return await query(Query, [u_id])
}

module.exports.ListInterests = async (user_id) => {
    let Query = `
        SELECT 
            i.*,
            u.*
        FROM interests AS i
        JOIN users AS u 
            ON u.u_id = 
                CASE 
                    WHEN i.i_sender_id = ? THEN i.i_receiver_id   -- user is sender → return receiver
                    WHEN i.i_receiver_id = ? THEN i.i_sender_id   -- user is receiver → return sender
                END
        WHERE 
            (i.i_sender_id = ? OR i.i_receiver_id = ?)
            AND i.i_status = 'accepted'
        ORDER BY 
            i.i_createdAt DESC `;

    const data = query(Query, [user_id, user_id, user_id, user_id]);

    return data;
};

