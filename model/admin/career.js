var db = require('../../config/db');
var util = require("util");
const query = util.promisify(db.query).bind(db);

module.exports.CheckCareername = async (career_name) => {
    let Query = `SELECT * FROM careers WHERE LOWER(career_name) = LOWER(?)`
    return await query(Query, [career_name])
}

module.exports.AddCareer = async (career_name) => {
    let Query = `insert into careers (career_name) values(?)`
    return await query(Query, [career_name])
}

module.exports.ListCareer = async () => {
    let Query = `select * from careers`
    return await query(Query)
}

module.exports.CheckCareer = async (career_id) => {
    let Query = `select * from careers where career_id =?`
    return await query(Query, [career_id])
}

module.exports.UpdateCareer = async (condition, career_id) => {
    let Query = `update careers set ${condition} where career_id =?`
    return await query(Query, [career_id])
}

module.exports.DeleteCareer = async (career_id) => {
    let Query = `delete from careers where career_id =?`
    return await query(Query, [career_id])
}

