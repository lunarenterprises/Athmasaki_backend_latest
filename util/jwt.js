let jwt = require('jsonwebtoken');

module.exports.GenerateToken = (data) => {
    return jwt.sign(
        data,
        process.env.SECRET_KEY,
        { expiresIn: "2h" }
    );
};
