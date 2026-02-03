var db = require('../../config/db');
var util = require("util");
const query = util.promisify(db.query).bind(db);

module.exports.CheckHobbiesname = async (Hobbies_name) => {
    let Query = `SELECT * FROM hobbies WHERE LOWER(hob_name) = LOWER(?)`
    return await query(Query, [Hobbies_name])
}

module.exports.AddHobbies = async (habit_name) => {
    let Query = `insert into hobbies (hob_name) values(?)`
    return await query(Query, [habit_name])
}

module.exports.ListHobbies = async () => {
    let Query = `select * from hobbies`
    return await query(Query)
}

module.exports.CheckHobbies = async (hob_id) => {
    let Query = `select * from hobbies where hob_id=?`
    return await query(Query, [hob_id])
}

module.exports.UpdateHobbies = async (condition, hob_id) => {
    let Query = `update hobbies set ${condition} where hob_id=?`
    return await query(Query, [hob_id])
}

module.exports.DeleteHobbies = async (hob_id) => {
    let Query = `delete from hobbies where hob_id=?`
    return await query(Query, [hob_id])
}
