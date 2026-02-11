const model = require('../../model//user/login')
const { addCountryCode } = require('../../util/formatMobile')
// const { HashPassword, ComparePassword } = require('../../util/bcrypt')
const { GenerateOtp, TimeAfter, isOtpExpired } = require('../../util/generateOTP')
const { transporter } = require('../../util/mailer')
const { GenerateToken } = require('../../util/jwt')
const { sendSMS, normalizeIndianNumber } = require('../../util/sms')
let moment = require('moment')

module.exports.LoginWithOtp = async (req, res) => {
  try {
    let { mobile } = req.body || {};

    if (!mobile) {
      return res.send({
        result: false,
        message: "mobile number is required"
      });
    }

    let userData = await model.LoginWithMobileOrEmail(mobile);
    if (userData.length == 0) {
      return res.send({
        result: false,
        message: "User not found."
      });
    }

    let user = userData[0];

    console.log(
      user.u_otp_attempt >= 3,
      user.u_otp_block_until !== null,
      new Date(user.u_otp_block_until) > new Date()
    );

    // 🛑 CHECK BLOCK STATUS
    if (
      user.u_otp_attempt >= 3 &&
      user.u_otp_block_until !== null &&
      new Date(user.u_otp_block_until) > new Date()
    ) {
      return res.send({
        result: false,
        message: "You are temporarily blocked due to multiple wrong OTP attempts. Try again after 3 hours."
      });
    }

    // ---------- SEND OTP ----------
    const token = GenerateOtp();
    const tokenExpiryTime = TimeAfter(5, "minutes");
    let datetime = moment().format("YYYY-MM-DD HH:mm:ss");

    // ❌ DO NOT reset attempts here (fixed bug)

    let updateUser = await model.UpdateToken(user.u_mobile, token, tokenExpiryTime);

    if (updateUser.affectedRows > 0) {
      // Login data tracking
      let checklogdata = await model.CheckLoginData(user.u_id, datetime);
      if (checklogdata.length > 0) {
        await model.UpdateLoginData(user.u_id, datetime);
      } else {
        await model.LoginData(user.u_id, datetime);
      }

      const normalisedPhone = normalizeIndianNumber(mobile)
      await sendSMS(normalisedPhone, token)

      return res.send({
        result: true,
        message: "OTP sent successfully. Please verify to continue."
      });
    }

    return res.send({
      result: false,
      message: "Failed to send OTP. Please try again later."
    });

  } catch (error) {
    return res.send({
      result: false,
      message: error.message
    });
  }
};



module.exports.LoginVerifyOtp = async (req, res) => {
  try {
    let { mobile, token, fcm_token } = req.body || {};

    if (!mobile || !token) {
      return res.send({
        result: false,
        message: "mobile number and OTP are required"
      });
    }

    let datetime = moment().format("YYYY-MM-DD HH:mm:ss");

    let userData = await model.CheckMobile(mobile);
    if (userData.length == 0) {
      return res.send({
        result: false,
        message: "Mobile number not found."
      });
    }

    let user = userData[0];

    // 🛑 CHECK BLOCK STATUS (FIX ADDED)
    if (
      user.u_otp_attempt >= 3 &&
      user.u_otp_block_until !== null &&
      new Date(user.u_otp_block_until) > new Date()
    ) {
      return res.send({
        result: false,
        message: "You are blocked for 3 hours due to multiple wrong OTP attempts."
      });
    }

    // OTP EXPIRED?
    if (isOtpExpired(user.u_token_expiry)) {
      return res.send({
        result: false,
        message: "OTP has expired. Please try again."
      });
    }

    // ❌ WRONG OTP
    // if ("1111" != token) {
    if (user.u_token != token){
      await model.IncreaseOtpAttempts(user.u_id);
      let attempts = await model.GetOtpAttempts(user.u_id);

      // BLOCK AFTER 3 WRONG ATTEMPTS
      if (attempts >= 3) {
        let blockUntil = moment().add(3, "hours").format("YYYY-MM-DD HH:mm:ss");
        await model.BlockUserFor3Hours(blockUntil, user.u_id);

        return res.send({
          result: false,
          message: "Too many wrong attempts. You are blocked for 3 hours."
        });
      }

      return res.send({
        result: false,
        message: "Invalid OTP. Please try again."
      });
    }

    // ✔ CORRECT OTP — RESET ATTEMPTS + CLEAR BLOCK
    await model.ResetOtpAttempts(user.u_id);
    await model.BlockUserFor3Hours(null, user.u_id);

    // Clear OTP
    let updateToken = await model.UpdateToken(mobile, null, null);
    if (updateToken.affectedRows === 0) {
      return res.send({
        result: false,
        message: "Failed to verify OTP."
      });
    }

    // LOGIN DATA
    let checklogdata = await model.CheckLoginData(user.u_id, datetime);
    if (checklogdata.length > 0) {
      await model.UpdateLoginData(user.u_id, datetime);
    } else {
      await model.LoginData(user.u_id, datetime);
    }

    // FCM TOKEN
    if (fcm_token) {
      let checkuserlogin = await model.CheckUserLogin(user.u_id);

      if (checkuserlogin.length > 0) {
        await model.UpdateUserToken(user.u_id, fcm_token);
      } else {
        await model.AddUserToken(user.u_id, fcm_token);
      }
    }

    // ACTIVATE USER IF INACTIVE
    if (user.u_status == "inactive") {
      await model.ActivateUSer(user.u_id);
    }

    // JWT TOKEN
    const jwttoken = GenerateToken({
      user_id: user.u_id,
      profile_id: user.u_profile_id,
      name: user.u_first_name + " " + user.u_last_name,
      email: user.u_email,
      gender: user.u_gender,
      status: user.u_status,
      role: user.u_role,
      plan: user.u_plan
    });

    // STORE JWT
    let checkjwttoken = await model.CheckJwtToken(user.u_id);

    if (checkjwttoken.length == 0) {
      await model.AddUserJWTToken(jwttoken, user.u_id);
    } else {
      await model.UpdateUserJWTToken(jwttoken, user.u_id);
    }

    return res.send({
      result: true,
      message: "OTP verified successfully",
      data: {
        user_id: user.u_id,
        name: user.u_first_name + " " + user.u_last_name,
        email: user.u_email,
        mobile: user.u_mobile,
        status: user.u_status,
        role: user.u_role,
        plan: user.u_plan,
        profile_completion: user.u_profile_completion,
        token: jwttoken
      }
    });

  } catch (error) {
    return res.send({
      result: false,
      message: error.message
    });
  }
};




module.exports.LogOut = async (req, res) => {
  try {
    let { user_id, role } = req.user
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(400).json({ message: 'Token missing' });

    let updatetoken

    if (role == 'user') {
      updatetoken = await model.UpdateUserJWTToken('null', user_id)
    } else {
      updatetoken = await model.UpdateAdminJwtToken('null', user_id)
    }

    if (updatetoken.affectedRows == 0) {
      return res.send({
        result: false,
        message: "Failed to Logout"
      })
    } else {
      return res.send({
        result: true,
        message: "Logged out successfully"
      })
    }


  } catch (error) {
    return res.send({
      result: false,
      message: error.message
    })
  }
}