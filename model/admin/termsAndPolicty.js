let db = require('../../config/db')
let util = require('util')
let query = util.promisify(db.query).bind(db)


module.exports.ListTermsAndPolicy = async () => {
    let Query = `select * from termsandPolicy`
    return await query(Query)
}

module.exports.AddTermsAndCondition = async (imagePath) => {
    let Query = `insert into termsandPolicy (termspolicy_terms_file) values(?)`
    return await query(Query, [imagePath])
}

module.exports.UpdateTermsAndCondition = async (imagePath) => {
    let Query = `update termsandPolicy set termspolicy_terms_file =?`
    return await query(Query, [imagePath])
}

module.exports.AddPrivacyAndPolicy = async (imagePath) => {
    let Query = `insert into termsandPolicy (termspolicy_policy_file) values(?)`
    return await query(Query, [imagePath])
}

module.exports.UpdatePrivacyAndPolicy = async (imagePath) => {
    let Query = `update termsandPolicy set termspolicy_policy_file =?`
    return await query(Query, [imagePath])
}
