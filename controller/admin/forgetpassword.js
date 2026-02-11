var model = require('../../model/admin/forgetpassword');
var moment = require('moment')
var bcrypt = require('bcrypt')
const { sendPasswordResetSMS } = require('../../util/sms')
const { GenerateOtp, TimeAfter, isOtpExpired } = require('../../util/generateOTP')

module.exports.forgotpassword = async (req, res) => {
    try {
        var mobile = req.body.mobile;
        if (!mobile) {
            return res.send({
                return: false,
                message: "insufficient parameters"
            })
        }

        let checkmobile = await model.CheckmobileQuery(mobile)

        if (checkmobile.length > 0) {
            let ad_id = checkmobile[0]?.ad_id

            const token = GenerateOtp()
            const tokenExpiryTime = TimeAfter(5, "minutes")

            let storetoken = await model.StoreResetToken(token, tokenExpiryTime, ad_id);

            if (storetoken.affectedRows > 0) {
                //sms send to mobile
                let sendotp = await sendPasswordResetSMS(mobile, token)
                if (sendotp == false) {
                    return res.send({
                        result: false,
                        message: "Failed to send OTP to your phone. Please try again."
                    })
                }
                // await model.updateOtpStatus(mobile, "unverified")
                return res.send({
                    result: true,
                    message: "Password reset OTP sent to mobile "
                })
            } else {
                return res.send({
                    result: false,
                    message: "failed to send Password reset OTP "
                })
            }
        } else {
            return res.send({
                result: false,
                message: "mobile number not found"
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}


module.exports.VerifyOtp = async (req, res) => {
    try {
        const { mobile, otp } = req.body
        if (!mobile || !otp) {
            return res.send({
                result: false,
                message: "mobile number and OTP are required"
            })
        }

        let checkmobile = await model.CheckmobileQuery(mobile)
        if (checkmobile.length == 0) {
            return res.send({
                result: false,
                message: "mobile number not found."
            })
        }
        const otpExpired = isOtpExpired(checkmobile[0]?.ad_token_expiry)

        if (otpExpired) {
            return res.send({
                result: false,
                message: "OTP has expired. Please try new one"
            })
        }

        if (checkmobile[0]?.ad_token != otp) {
        // if ('1111' != otp) {

            return res.send({
                result: false,
                message: "Invalid OTP. Please enter correct one."
            })
        }

        let updateuserdata = await model.StoreResetToken('null', 'null', checkmobile[0]?.ad_id)
        if (updateuserdata.affectedRows > 0) {

            return res.send({
                result: true,
                message: "OTP verification successfull"
            })

        } else {
            return res.send({
                result: false,
                message: "Failed to verify OTP"
            })
        }

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}


module.exports.ResetPassword = async (req, res) => {
    try {
        let { mobile, password } = req.body

        if (!mobile || !password) {
            return res.send({
                result: false,
                message: "insufficent parameter"
            });
        }
        var hashedpassword = await bcrypt.hash(password, 10)

        let ChangePassword = await model.updatepassword(hashedpassword, mobile);

        if (ChangePassword.affectedRows > 0) {

            return res.send({
                result: true,
                message: "Password changed successfully,please relogin",
            });

        } else {
            return res.send({
                result: false,
                message: "failed to change password "
            })
        }

    } catch (error) {
        return res.send({
            result: false,
            message: error.message

        })
    }
}
