var db = require('../../config/db');
var util = require("util");
const query = util.promisify(db.query).bind(db);

module.exports.Checkfaqquestion = async (Faq_question) => {
    let Query = `SELECT * FROM faq WHERE LOWER(faq_question) = LOWER(?)`
    return await query(Query, [Faq_question])
}

module.exports.AddFaq = async (Faq_question, Faq_answer) => {
    let Query = `insert into faq (faq_question,faq_answer) values(?,?)`
    return await query(Query, [Faq_question, Faq_answer])
}

module.exports.ListFaq = async () => {
    let Query = `select * from faq`
    return await query(Query)
}

module.exports.CheckFaq = async (faq_id) => {
    let Query = `select * from faq where faq_id=?`
    return await query(Query, [faq_id])
}

module.exports.UpdateFaq = async (condition, faq_id) => {
    let Query = `update faq set ${condition} where faq_id=?`
    return await query(Query, [faq_id])
}

module.exports.DeleteFaq = async (faq_id) => {
    let Query = `delete from faq where faq_id=?`
    return await query(Query, [faq_id])
}

