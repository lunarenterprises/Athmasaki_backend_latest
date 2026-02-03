var db = require('../../config/db');
var util = require("util");
const query = util.promisify(db.query).bind(db);


module.exports.checkVisited = async (sender_id, reciever_id) => {
    let Query = `select * from profile_visit where pv_visiter_id=? and pv_profile_id=?`
    return await query(Query, [sender_id, reciever_id])
}

module.exports.CheckReceiver = async (reciever_id) => {
    let Query = `select * from users where u_id=?`
    return await query(Query, [reciever_id])
}

module.exports.AddProfileVist = async (sender_id, reciever_id) => {
    let Query = `insert into profile_visit (pv_visiter_id,pv_profile_id) values(?,?)`
    return await query(Query, [sender_id, reciever_id])
}

module.exports.ListProfileVisit = async (user_id) => {
    let Query = `SELECT pf.*, u.u_first_name, u.u_last_name
                FROM profile_visit pf 
                LEFT JOIN users u ON pf.pv_visiter_id = u.u_id 
                WHERE pf.pv_visiter_id = ? `
    return await query(Query, [user_id])
}

module.exports.GetprofileImage = async (u_id) => {
    let Query = `select * from user_images where ui_u_id=?`
    return await query(Query, [u_id])
}

module.exports.GetPlanDetails = async (plan_id) => {
    let Query = `SELECT * FROM plans WHERE p_id = ?`
    return await query(Query, [plan_id])
}

module.exports.ListInterestReject = async (user_id) => {
    let Query = `SELECT i.*, u.u_first_name, u.u_last_name
                FROM interests i 
                LEFT JOIN users u ON i.i_sender_id = u.u_id 
                WHERE i.i_sender_id = ? and i.i_status ='rejected' `
    return await query(Query, [user_id])
}