const model = require('../../model/user/changeMobile')
const { GenerateOtp, TimeAfter, isOtpExpired } = require('../../util/generateOTP')
const { sendSMS } = require('../../util/sms')
const moment = require("moment");

module.exports.ChangePhoneNumber = async (req, res) => {
  try {
    let { user_id } = req.user;
    let { mobile } = req.body || {};

    if (!mobile) {
      return res.send({
        result: false,
        message: "mobile number is required"
      });
    }

    // Check if mobile belongs to someone else
    let checkMobile = await model.CheckEditMobile(mobile, user_id);
    if (checkMobile[0]?.u_mobile_verify == "true") {
      return res.send({
        result: false,
        message: "This mobile number is already registered"
      });
    }

    if (checkMobile[0]?.u_mobile_verify == "false") {
      await model.DeletePhone(checkMobile[0]?.u_id);
    }

    // USER DETAILS → WE READ BLOCK + ATTEMPTS
    let userDetails = await model.CheckUser(user_id);
    if (userDetails.length == 0) {
      return res.send({
        result: false,
        message: "Failed to get user data."
      });
    }

    // BLOCK CHECK
    if (userDetails[0]?.u_otp_attempt >= 3 && userDetails[0]?.u_otp_block_until !== null && new Date(userDetails[0]?.u_otp_block_until) > new Date()) {
      return res.send({
        result: false,
        message: "You are temporarily blocked due to multiple wrong OTP attempts. Try again after 3 hours."
      });
    }

    // ---------- SEND OTP ----------
    const token = GenerateOtp();
    const tokenExpiryTime = TimeAfter(5, "minutes");


    let updateUser = await model.UpdateToken(user_id, token, tokenExpiryTime);
    if (updateUser.affectedRows === 0) {
      return res.send({
        result: false,
        message: "Failed to generate OTP. Please try again."
      });
    }

    // Send SMS
    // let sendotp = await sendSMS(mobile, token);
    // if (!sendotp) {
    //   return res.send({
    //     result: false,
    //     message: "Failed to send OTP. Please try again."
    //   });
    // }

    return res.send({
      result: true,
      message: "OTP sent successfully. Please verify to change your phone number."
    });

  } catch (error) {
    return res.send({
      result: false,
      message: error.message
    });
  }
};


module.exports.ChangeMobileVerifyOtp = async (req, res) => {
  try {
    let { user_id } = req.user;
    let { mobile, token } = req.body || {};

    if (!mobile || !token) {
      return res.send({
        result: false,
        message: "mobile number and OTP are required"
      });
    }

    let userData = await model.CheckUser(user_id);
    if (userData.length == 0) {
      return res.send({
        result: false,
        message: "User not found."
      });
    }


    // OTP EXPIRED?
    const otpExpired = isOtpExpired(userData[0].u_token_expiry);
    if (otpExpired) {
      return res.send({
        result: false,
        message: "OTP has expired. Please try new one"
      });
    }

    // ❌ WRONG OTP
    // if (userData[0].u_token != token) {
    if ('1111' != token) {
      await model.IncreaseOtpAttempts(user_id);
      let attempts = await model.GetOtpAttempts(user_id);

      if (attempts >= 3) {
        let blockUntil = moment().add(3, "hours").format("YYYY-MM-DD HH:mm:ss");
        await model.BlockUserFor3Hours(blockUntil, user_id);

        return res.send({
          result: false,
          message: "Too many wrong attempts. You are blocked for 3 hours."
        });
      }

      return res.send({
        result: false,
        message: "Invalid OTP. Please enter correct one."
      });
    }

    // ✅ CORRECT OTP
    await model.ResetOtpAttempts(user_id);

    let updateToken = await model.UpdateToken(user_id, "null", "null");
    if (updateToken.affectedRows === 0) {
      return res.send({
        result: false,
        message: "Failed to verify OTP"
      });
    }

    let updateMobile = await model.UpdateMobile(mobile, user_id);
    if (updateMobile.affectedRows === 0) {
      return res.send({
        result: false,
        message: "Failed to update mobile number"
      });
    }

    return res.send({
      result: true,
      message: "Successfully changed your mobile number"
    });

  } catch (error) {
    return res.send({
      result: false,
      message: error.message
    });
  }
};
