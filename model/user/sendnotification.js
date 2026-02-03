var db = require("../../config/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);

module.exports.AddNotification = async (sender_id, receiver_id, message, type, date, time) => {
    var Query = `insert into notification (n_sender_id,n_receiver_id,n_message,n_type,n_date,n_time) values (?,?,?,?,?,?)`;
    var data = query(Query, [sender_id, receiver_id, message, type, date, time]);
    return data;
};

module.exports.ListNotification = async (user_id, condition) => {
    const Query = `select * from notification where n_receiver_id =? ${condition} order by n_id desc;`
    console.log(Query);

    return await query(Query, [user_id])
}

module.exports.GetUser = async (user_id) => {
    const Query = `
        SELECT u_first_name,u_first_name,u_profile_id
        FROM users WHERE u_id = ?
    `;
    return await query(Query, [user_id]);
}

module.exports.GetUserImage = async (user_id) => {
    const Query = `SELECT * FROM user_images WHERE ui_u_id = ?`;
    return await query(Query, [user_id]);
}

module.exports.ReadNotification = async (user_id) => {
    const Query = `update notification set n_read ='1' where n_receiver_id =? and n_read ='0'`
    console.log(Query);

    return await query(Query, [user_id])
}


