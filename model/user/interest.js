var db = require('../../config/db');
var util = require("util");
const query = util.promisify(db.query).bind(db);


module.exports.CheckInterestSended = async (sender_id, reciever_id) => {
    let Query = `select * from interests where i_sender_id=? and i_receiver_id=?`
    return await query(Query, [sender_id, reciever_id])
}

module.exports.CheckInterestLimit = async (user_id) => {
    let Query = `select * from subscriptions where s_user_id=? and s_status ='active'`
    return await query(Query, [user_id])
}

module.exports.UpdatePlanStatus = async (s_id) => {
    let Query = `update subscriptions set s_status = 'inactive' where s_id = ?`
    return await query(Query, [s_id])
}

module.exports.Checkmatch = async (sender_id, reciever_id) => {
    let Query = `select * from matches where (m_user_id=? and m_matched_user_id=?) or (m_user_id=? and m_matched_user_id=?)`
    return await query(Query, [sender_id, reciever_id, reciever_id, sender_id])
}

module.exports.CheckReceiver = async (reciever_id) => {
    let Query = `select * from users where u_id=?`
    return await query(Query, [reciever_id])
}

module.exports.SendInterest = async (sender_id, reciever_id) => {
    let Query = `insert into interests (i_sender_id,i_receiver_id) values(?,?)`
    return await query(Query, [sender_id, reciever_id])
}

module.exports.UpdateInterestLimit = async (balanceinterest, s_id) => {
    let Query = `update subscriptions set s_interest_limit = ? where s_id = ?`
    return await query(Query, [balanceinterest, s_id])
}

module.exports.SendDislike = async (m_id) => {
    let Query = `update matches set m_dislike = 1 where m_id = ?`
    return await query(Query, [m_id])
}

module.exports.CheckBlock = async (sender_id, reciever_id) => {
    let Query = `select * from blocked_users where bu_sender_id=? and bu_blocked_id=?`
    return await query(Query, [sender_id, reciever_id])
}

module.exports.SendBlock = async (sender_id, reciever_id, reason) => {
    let Query = `insert into blocked_users (bu_sender_id,bu_blocked_id,bu_reason) values(?,?,?)`
    return await query(Query, [sender_id, reciever_id, reason])
}

module.exports.SendUnBlock = async (sender_id, reciever_id) => {
    let Query = `delete from blocked_users where bu_id=?`
    return await query(Query, [sender_id, reciever_id])
}

module.exports.ListInterests = async (user_id, condition) => {
    let Query = ` SELECT 
            i.*,
            u.*
        FROM interests i 
        JOIN users u ON u.u_id = i.i_receiver_id 
        WHERE i.i_sender_id = ? and i.i_status ='pending' ${condition} ORDER BY i.i_createdAt DESC `;
    const data = query(Query, [user_id]);
    return data;
};


module.exports.ListBlocked = async (user_id, condition) => {
    let Query = ` SELECT 
            bu.*,
            u.u_id,u.u_profile_id,u.u_first_name,u.u_last_name,u.u_email,u.u_gender
        FROM blocked_users  bu
        JOIN users u ON u.u_id = bu.bu_blocked_id 
        WHERE bu.bu_sender_id = ? ${condition} ORDER BY bu.bu_createdat DESC `;
    const data = query(Query, [user_id]);

    return data;
};

module.exports.AdminListBlocked = async () => {
    let Query = ` SELECT 
            bu.*,
            u.u_id,u.u_profile_id,u.u_first_name,u.u_last_name,u.u_email,u.u_gender
        FROM blocked_users  bu
        JOIN users u ON u.u_id = bu.bu_blocked_id 
        ORDER BY bu.bu_createdat DESC `;

    const data = query(Query);
    return data;
};

module.exports.ListIncomingInterests = async (user_id, condition) => {
    let Query = ` SELECT 
            i.*,
            u.*
        FROM interests i
        JOIN users u ON u.u_id = i.i_sender_id
        WHERE i.i_receiver_id = ? and i.i_status ='pending' ${condition} ORDER BY i.i_createdAt DESC `;
    const data = query(Query, [user_id]);
    return data;
};

module.exports.CheckInterestWithId = async (interest_id, user_id) => {
    let Query = `SELECT * FROM interests WHERE i_id = ? AND i_receiver_id = ? `;
    return await query(Query, [interest_id, user_id]);
};

module.exports.GetprofileImage = async (u_id) => {
    let Query = `select * from user_images where ui_u_id=?`
    return await query(Query, [u_id])
}

module.exports.UpdateInterestStatus = async (interest_id, status) => {
    let Query = `update interests set i_status=? where i_id=?`
    return await query(Query, [status, interest_id])
}

module.exports.GetPartnerData = async (partner_id) => {
    let Query = `select u_id,
            u_profile_id,
            u_firstname,
            u_lastname,
            u_profile_pic,
            u_gender,
            u_dob,
            u_religion,
            u_community,
            u_hobbies,
            u_about,
            u_country,
            u_state,
            u_city from users where u_id=?`
    return await query(Query, [partner_id])
}

module.exports.CheckWishlist = async (user_id, partner_id) => {
    let Query = `select * from wishlists where w_user_id=? and w_partner_id=?`
    return await query(Query, [user_id, partner_id])
}

module.exports.RemoveFromWishlist = async (user_id, partner_id) => {
    let Query = `delete from wishlists where w_user_id=? and w_partner_id=?`
    return await query(Query, [user_id, partner_id])
}
