var db =require("../../config/db")
var util =require("util")
const query =util.promisify(db.query).bind(db);


module.exports.CheckmobileQuery =async (mobile)=>{
    var Query= `select * from admins where ad_mobile=?`;
    var data = await query(Query,[mobile]);
    return data;
};

module.exports.updatepassword =async (password,mobile)=>{
    var Query= `update admins set ad_password=? where ad_mobile=?`;
    var data =await query(Query,[password,mobile]);
    return data;
};

module.exports.StoreResetToken = async (token, expirationDate, ad_id) => {
    var Query = `update admins SET ad_token = ?, ad_token_expiry = ? WHERE ad_id = ?`;
    var data = await query(Query, [token, expirationDate, ad_id]);
    return data;
};
module.exports.ValidateResetToken =async(mobile,otp)=>{
    var Query= `select * FROM admins WHERE ad_mobile=? AND ad_token=?`;
    var data =await query(Query,[mobile,otp]);
    return  data;
};
module.exports.updateOtpStatus =async (mobile)=>{
    var Query=`update admins set ad_token='null',ad_token_expiry ='null' where ad_mobile=?`;
    var  data =await query(Query,[mobile])
    return data;
}
