var db = require('../../config/db');
var util = require("util");
const query = util.promisify(db.query).bind(db);

module.exports.CheckBirthStarsquestion = async (birthstars_name) => {
    let Query = `SELECT * FROM birth_stars WHERE LOWER(birth_stars_name) = LOWER(?)`
    return await query(Query, [birthstars_name])
}

module.exports.AddBirthStars = async (birthstars_name) => {
    let Query = `insert into birth_stars (birth_stars_name) values(?)`
    return await query(Query, [birthstars_name])
}

module.exports.ListBirthStars = async () => {
    let Query = `select * from birth_stars`
    return await query(Query)
}

module.exports.CheckBirthStars = async (birth_stars_id ) => {
    let Query = `select * from birth_stars where birth_stars_id =?`
    return await query(Query, [birth_stars_id ])
}

module.exports.UpdateBirthStars = async (condition, birth_stars_id ) => {
    let Query = `update birth_stars set ${condition} where birth_stars_id =?`
    return await query(Query, [birth_stars_id ])
}

module.exports.DeleteBirthStars = async (birthstars_id) => {
    let Query = `delete from birth_stars where birth_stars_id =?`
    return await query(Query, [birthstars_id])
}

