const crypto = require('crypto');
const moment = require('moment')


module.exports.GenerateOtp = () => {
    return crypto.randomInt(1000, 10000); // upper bound is exclusive
};

module.exports.TimeAfter = (amount, unit) => {
    return moment().add(amount, unit).format('YYYY-MM-DD HH:mm:ss');
};

module.exports.isOtpExpired = (tokenExpiryFromDb) => {
    const now = moment(); 
    const expiry = moment(tokenExpiryFromDb);

    return now.isAfter(expiry); // true => expired
};
