var db = require('../../config/db');
var util = require("util");
const query = util.promisify(db.query).bind(db);

module.exports.CheckUser = async (u_id) => {
  let Query = `select * from users where u_id=?`
  return await query(Query, [u_id])
}

module.exports.CheckPreference = async (user_id) => {
  let Query = `select * from partner_preference where pp_user_id=?`
  return await query(Query, [user_id])
}

module.exports.Checkcolumnames = async () => {
  let Query = `SELECT CONCAT(
    '{',
    GROUP_CONCAT(CONCAT('"', COLUMN_NAME, '": ""') ORDER BY ORDINAL_POSITION SEPARATOR ','),
    '}'
) AS json_columns
FROM information_schema.columns
WHERE table_schema = 'u160357475_athmasakhi'
  AND table_name = 'partner_preference'`
  return await query(Query)
}

// Insert new preference
module.exports.InsertPartnerPreference = async (data) => {
  const Query = `
    INSERT INTO partner_preference 
    (pp_user_id,pp_from_age,pp_to_age, pp_gender, pp_religion, pp_community, pp_education, pp_profession, pp_smoking, pp_drinking)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ? ,?)
  `;

  const params = [
    data.pp_user_id,
    data.pp_from_age,
    data.pp_to_age,
    data.pp_gender,
    data.pp_religion,
    data.pp_community,
    data.pp_education,
    data.pp_profession,
    data.pp_smoking,
    data.pp_drinking
  ];

  return await query(Query, params);
};



// Update preference by pp_id
module.exports.UpdatePartnerPreference = async (updateString, pp_id) => {
  const Query = `UPDATE partner_preference SET ${updateString} WHERE pp_id = ?`;
  return await query(Query, [pp_id]);
}

module.exports.ProfileCompletion = async (u_id) => {
  let Query = `update users set u_profile_completion ='4' where u_id=?`
  return await query(Query, [u_id])
}