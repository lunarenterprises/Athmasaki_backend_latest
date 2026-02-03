var db = require('../../config/db');
var util = require("util");
const query = util.promisify(db.query).bind(db);

module.exports.CheckHabbitname = async (habit_name) => {
    let Query = `SELECT * FROM habits WHERE LOWER(h_name) = LOWER(?)`
    return await query(Query, [habit_name])
}

module.exports.AddHabit = async (habit_name, habit_options) => {
    let Query = `insert into habits (h_name,h_options) values(?,?)`
    return await query(Query, [habit_name, habit_options])
}

module.exports.ListHabit = async () => {
    let Query = `select * from habits`
    return await query(Query)
}

module.exports.CheckHabit = async (h_id) => {
    let Query = `select * from habits where h_id=?`
    return await query(Query, [h_id])
}

module.exports.UpdateHabit = async (condition, h_id) => {
    let Query = `update habits set ${condition} where h_id=?`
    return await query(Query, [h_id])
}

module.exports.DeleteHabit = async (h_id) => {
    let Query = `delete from habits where h_id=?`
    return await query(Query, [h_id])
}

