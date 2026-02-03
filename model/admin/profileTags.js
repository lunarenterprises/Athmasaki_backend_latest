var db = require('../../config/db');
var util = require("util");
const query = util.promisify(db.query).bind(db);

module.exports.AddProfileTags = async (habit_name) => {
    let Query = `insert into profiletags (pft_name) values(?)`
    return await query(Query, [habit_name])
}

module.exports.ListProfileTags = async () => {
    let Query = `select * from profiletags`
    return await query(Query)
}

module.exports.CheckProfileTags = async (pft_id) => {
    let Query = `select * from profiletags where pft_id=?`
    return await query(Query, [pft_id])
}

module.exports.UpdateProfileTags = async (condition, pft_id) => {
    let Query = `update profiletags set ${condition} where pft_id=?`
    return await query(Query, [pft_id])
}

module.exports.DeleteProfileTags = async (pft_id) => {
    let Query = `delete from profiletags where pft_id=?`
    return await query(Query, [pft_id])
}

