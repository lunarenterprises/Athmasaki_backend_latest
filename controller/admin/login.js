const model = require('../../model/admin/login')
const { addCountryCode } = require('../../util/formatMobile')
const { HashPassword, ComparePassword } = require('../../util/bcrypt')
const { GenerateToken } = require('../../util/jwt')

module.exports.AdminLogin = async (req, res) => {
    try {

        let { mobileEmail, password } = req.body || {}
        if (!mobileEmail || !password) {
            return res.send({
                result: false,
                message: "mobile number/email and password is required"
            })
        }

        // mobile = addCountryCode(mobile)
        // console.log("mobile", mobile);

        let userData = await model.LoginWithMobileOrEmail(mobileEmail)
        if (userData.length == 0) {
            return res.send({
                result: false,
                message: "User not found."
            })
        }

        let permissionData = await model.AdminPermission(userData[0]?.ad_id)
        if (permissionData.length == 0) {
            return res.send({
                result: false,
                message: "Admin permission not found."
            })
        }
        //sms send to mobile
        // await sendSMS(formattedNumber, message)
        const isPasswordValid = await ComparePassword(password, userData[0]?.ad_password);
        if (!isPasswordValid) {
            return res.status(400).json({
                result: false,
                message: 'invalid credentials',
            });
        }

        const token = GenerateToken({
            user_id: userData[0]?.ad_id,
            name: userData[0]?.ad_name,
            email: userData[0]?.ad_email,
            status: userData[0]?.ad_status,
            role: userData[0]?.ad_role,
        })


        var adduserjwttoken
        let checkjwttoken = await model.CheckJwtToken(userData[0]?.u_id)
        // console.log("adminlogin,", checkjwttoken);

        if (checkjwttoken.length == 0) {
            adduserjwttoken = await model.AddUserJWTToken(token, userData[0].u_id)
            // console.log("login Add admin JWTToken,", checkjwttoken);

        } else {
            adduserjwttoken = await model.UpdateAdminToken(token, userData[0].u_id)
            // console.log("loginUpdate admin JWTToken,", checkjwttoken);

        }

        if (adduserjwttoken.affectedRows == 0) {
            return res.send({
                result: false,
                message: "Failed to add user token. Please try again."
            })
        }


        let addusertoken = await model.AddAdminJWTToken(token, userData[0].ad_id)
        if (addusertoken.affectedRows == 0) {
            return res.send({
                result: false,
                message: "Failed to add user token. Please try again."
            })
        }

        return res.send({
            result: true,
            message: "Login successful",
            data: {
                user_id: userData[0]?.ad_id,
                name: userData[0]?.ad_name,
                email: userData[0]?.ad_email,
                status: userData[0]?.ad_status,
                role: userData[0]?.ad_role,
                permissions: permissionData,
                token
            }
        })

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

