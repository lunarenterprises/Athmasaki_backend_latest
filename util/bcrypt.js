const bcrypt = require('bcrypt')

module.exports.HashPassword = async (password) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        return hash
    } catch (error) {
        return error.message
    }
}

module.exports.ComparePassword = async (password, hash) => {
    try {
        const isMatch = await bcrypt.compare(password, hash);
        console.log(isMatch);

        return isMatch

    } catch (error) {
        return error.message
    }
}