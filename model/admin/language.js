var db = require('../../config/db');
var util = require("util");
const query = util.promisify(db.query).bind(db);

module.exports.CheckLanguagename = async (Language_name) => {
    let Query = `SELECT * FROM language WHERE LOWER(language_name) = LOWER(?)`
    return await query(Query, [Language_name])
}

module.exports.AddLanguage = async (Language_name) => {
    let Query = `insert into language (language_name) values(?)`
    return await query(Query, [Language_name])
}

module.exports.ListLanguage = async () => {
    let Query = `select * from language`
    return await query(Query)
}

module.exports.CheckLanguage = async (language_id) => {
    let Query = `select * from language where language_id=?`
    return await query(Query, [language_id])
}

module.exports.UpdateLanguage = async (condition, language_id) => {
    let Query = `update language set ${condition} where language_id=?`
    return await query(Query, [language_id])
}

module.exports.DeleteLanguage = async (language_id) => {
    let Query = `delete from language where language_id=?`
    return await query(Query, [language_id])
}

