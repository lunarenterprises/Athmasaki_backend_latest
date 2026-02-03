var db = require('../../config/db');
var util = require("util");
const query = util.promisify(db.query).bind(db);

module.exports.validateUser = async (user_id) => {
    let Query = `select * from users where u_id=?`
    return await query(Query, [user_id])
}

module.exports.validatePlan = async (plan_id) => {
    let Query = `select * from plans where p_id =?`
    return await query(Query, [plan_id])
}

module.exports.validateAddonPlan = async (plan_id) => {
    let Query = `select * from add_on_plan where ap_id =?`
    return await query(Query, [plan_id])
}

module.exports.AddPayment = async (user_id, plan_type, plan_id, amount, order_id, payment_id, signature, verify_status, payment_status) => {
    let Query = `insert into paymentHistory (ph_user_id,ph_plan_type,ph_plan_id,ph_amount,ph_order_id,ph_payment_id,ph_signature,ph_verify_status,ph_status) values(?,?,?,?,?,?,?,?,?)`
    return await query(Query, [user_id, plan_type, plan_id, amount, order_id, payment_id, signature, verify_status, payment_status])
}

module.exports.UpdateUserSubscription = async (user_id, p_id, p_name,amount, p_interest_limit, p_monthly_interest, p_duration, start_date, end_date) => {
    const Query = `UPDATE subscriptions SET s_plan_id = ?, s_plan_name = ?,s_price=?, s_interest_limit = ?, s_monthly_limit = ?, s_duration = ?, s_start_date = ?, s_end_date = ?,s_status ='active' WHERE s_user_id = ?`;
    return await query(Query, [p_id, p_name,amount, p_interest_limit, p_monthly_interest, p_duration, start_date, end_date, user_id]);
};

module.exports.UpdateUserPlanId = async (user_id, plan_id) => {
    const Query = `UPDATE users SET u_plan = ? WHERE u_id = ?`;
    return await query(Query, [plan_id, user_id]);
};

module.exports.UpdateUserAddOnSubscription = async (user_id, p_interest_limit) => {
    const Query = `UPDATE subscriptions SET s_interest_limit = s_interest_limit + ? WHERE s_user_id = ?`;
    return await query(Query, [p_interest_limit, user_id]);
};

module.exports.Checkmatch = async (sender_id, reciever_id) => {
    let Query = `select * from matches where (m_user_id=? and m_matched_user_id=?) or (m_user_id=? and m_matched_user_id=?)`
    return await query(Query, [sender_id, reciever_id, reciever_id, sender_id])
}

module.exports.CheckReceiver = async (reciever_id) => {
    let Query = `select * from users where u_id=?`
    return await query(Query, [reciever_id])
}


module.exports.CheckInterestLimit = async (user_id) => {
    let Query = `select * from subscriptions where s_user_id=? and s_status ='active'`
    return await query(Query, [user_id])
}

module.exports.CheckInterestSended = async (sender_id, reciever_id) => {
    let Query = `select * from interests where i_sender_id=? and i_receiver_id=?`
    return await query(Query, [sender_id, reciever_id])
}

module.exports.SendInterest = async (sender_id, reciever_id) => {
    let Query = `insert into interests (i_sender_id,i_receiver_id) values(?,?)`
    return await query(Query, [sender_id, reciever_id])
}

module.exports.getAllPayments = async () => {
    let Query = `select * from paymentHistory order by ph_id desc`
    return await query(Query)
}

module.exports.getUserById = async (user_id) => {
    let Query = `select u_profile_id,u_first_name,u_last_name,u_mobile from users where u_id=?`
    return await query(Query, [user_id])
}

module.exports.getPlanById = async (plan_type, plan_id) => {
    let Query = plan_type == "subscription" ? `select * from plans where p_id=?` : `select * from add_on_plan where ap_id=?`;
    return await query(Query, [plan_id])
}
