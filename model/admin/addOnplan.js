var db = require('../../config/db');
var util = require("util");
const query = util.promisify(db.query).bind(db);


module.exports.CreateAddOnPlan = async (name, price, contact_limit,) => {
    let Query = `insert into add_on_plan (ap_name,ap_price,ap_interest) values(?,?,?)`
    return await query(Query, [name, price, contact_limit,])
}

module.exports.ListAllPlans = async () => {
    let Query = `select * from add_on_plan`
    return await query(Query)
}

module.exports.CheckPlan = async (plan_id) => {
    let Query = `select * from add_on_plan where ap_id=?`
    return await query(Query, [plan_id])
}

module.exports.UpdatePlan = async (condition, plan_id) => {
    let Query = `update add_on_plan set ${condition} where ap_id=?`
    return await query(Query, [plan_id])
}

module.exports.DeletePlan = async (plan_id) => {
    let Query = `delete from add_on_plan where ap_id=?`
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

module.exports.UpdatePlanStatus=async(plan_id,status)=>{
    let Query=`update plans set p_status=? where p_id=?`
    return await query(Query,[status,plan_id])
}