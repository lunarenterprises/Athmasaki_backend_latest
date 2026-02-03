var db = require('../../config/db');
var util = require("util");
const query = util.promisify(db.query).bind(db);

module.exports.CheckEducationname = async (education_name) => {
    let Query = `SELECT * FROM education WHERE LOWER(education_name) = LOWER(?)`
    return await query(Query, [education_name])
}

module.exports.AddEducation = async (education_name) => {
    let Query = `insert into education (education_name) values(?)`
    return await query(Query, [education_name])
}

module.exports.ListEducation = async () => {
    let Query = `select * from education`
    return await query(Query)
}

module.exports.CheckEducation = async (education_id ) => {
    let Query = `select * from education where education_id =?`
    return await query(Query, [education_id ])
}

module.exports.UpdateEducation = async (condition, education_id ) => {
    let Query = `update education set ${condition} where education_id =?`
    return await query(Query, [education_id ])
}

module.exports.DeleteEducation = async (birthstars_id) => {
    let Query = `delete from education where education_id =?`
    return await query(Query, [birthstars_id])
}

