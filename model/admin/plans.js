var db = require('../../config/db');
var util = require("util");
const query = util.promisify(db.query).bind(db);


module.exports.CreatePlan = async (name, price, contact_limit, monthly_interest, duration, contact, who_visited, who_liked, who_declined, chat) => {
    let Query = `insert into plans (p_name,p_price,p_interest_limit,p_monthly_interest,p_duration,p_contact,p_who_visited,p_who_liked,p_who_declined,p_chat) values(?,?,?,?,?,?,?,?,?,?)`
    return await query(Query, [name, price, contact_limit, monthly_interest, duration, contact, who_visited, who_liked, who_declined, chat])
}

module.exports.CheckPlanname = async (name) => {
    let Query = `select * from plans where lower(p_name)=?`
    return await query(Query, [name.toLowerCase()])
}

module.exports.ListAllPlans = async () => {
    let Query = `select * from plans where p_status='active'`
    return await query(Query)
}

module.exports.GetUserCountByPlan = async () => {
    const Query = `
        SELECT s_plan_id, COUNT(*) AS total_users
        FROM subscriptions
        GROUP BY s_plan_id
    `;
    return await query(Query);
};

module.exports.GetUserActiveSubscription = async (user_id) => {
    let Query = `SELECT s_plan_id 
        FROM subscriptions 
        WHERE s_user_id = ? AND s_status = 'active'
        LIMIT 1`
    return await query(Query, [user_id])
}

module.exports.CheckPlan = async (plan_id) => {
    let Query = `select * from plans where p_id=?`
    return await query(Query, [plan_id])
}

module.exports.UpdatePlan = async (condition, plan_id) => {
    let Query = `update plans set ${condition} where p_id=?`
    return await query(Query, [plan_id])
}

module.exports.DeletePlan = async (plan_id) => {
    let Query = `delete from plans where p_id=?`
    return await query(Query, [plan_id])
}

module.exports.CheckUser = async (user_id) => {
    let Query = 'select u_firstname,u_lastname,u_email,u_mobile from users where u_id=?'
    return await query(Query, [user_id])
}

// module.exports.AddSubscription=async(user_id,plan_id,plan_name,price,contact_limit,duration,start_date,end_date)=>{
//     let Query=`insert into subscriptions (s_user_id,s_plan_id,s_plan_name,s_price,s_contact_limit,s_duration,s_start_date,s_end_date) values(?,?,?,?,?,?,?,?)`
//     return await query(Query,[user_id,plan_id,plan_name,price,contact_limit,duration,start_date,end_date])
// }

// module.exports.ExpireUserSubscriptions = async (user_id) => {
//     let Query = `
//         UPDATE subscriptions
//         SET s_status = 'expired'
//         WHERE s_user_id = ?
//           AND s_status = 'active'
//     `;
//     return await query(Query, [user_id]);
// };
