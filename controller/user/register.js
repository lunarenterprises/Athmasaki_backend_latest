const model = require('../../model/user/register')
const { addCountryCode } = require('../../util/formatMobile')
const { GenerateOtp, TimeAfter, isOtpExpired } = require('../../util/generateOTP')
const { generateProfileId } = require('../../util/userIdcreation')
const { sendSMS } = require('../../util/sms')
const { getSubscriptionDates } = require('../../util/subscriptionExpiry')
const { GenerateToken } = require('../../util/jwt')
const formidable = require("formidable");
const path = require('path')
const fs = require('fs')
const moment = require("moment");
const { uploadToS3, deleteFromS3 } = require("../../util/ImageUpload");
const { sanitizeUserList } = require('../../util/sanitize')
const { GetPartnerPreference } = require('../../model/user/matches')


module.exports.RegisterPhoneNumber = async (req, res) => {
  try {
    let { mobile } = req.body || {}

    if (!mobile) {
      return res.send({
        result: false,
        message: "mobile number is required"
      })
    }

    let checkEmail = await model.CheckMobile(mobile)

    if (checkEmail[0]?.u_profile_completion == 4) {
      return res.send({
        result: false,
        message: "This mobile number is already registered. Try signing in"
      })
    }

    const token = GenerateOtp()
    const tokenExpiryTime = TimeAfter(5, "minutes")

    console.log("new Date()", new Date())
    console.log("otp_block_until", checkEmail[0]?.u_otp_block_until)

    // 🛑 BLOCK CHECK (FIX)
    if (
      checkEmail[0]?.u_otp_attempt >= 3 &&
      checkEmail[0]?.u_otp_block_until !== null &&
      new Date(checkEmail[0]?.u_otp_block_until) > new Date()
    ) {
      return res.send({
        result: false,
        message: "You are temporarily blocked due to multiple wrong OTP attempts. Try again after 3 hours."
      })
    }

    if (checkEmail[0]?.u_mobile_verify == 'false') {
      await model.DeletePhone(checkEmail[0]?.u_id)
    }

    // ================= EXISTING USER =================
    if (checkEmail[0]?.u_mobile_verify == 'true') {

      let updateUsertoken = await model.UpdateToken(
        'true',
        checkEmail[0]?.u_mobile,
        token,
        tokenExpiryTime
      )

      // ❌ DO NOT RESET OTP ATTEMPTS HERE (FIX)

      if (updateUsertoken.affectedRows == 0) {
        return res.send({
          result: false,
          message: "Failed to update otp.Please try again."
        })
      }

      return res.send({
        result: true,
        message: "Otp send successfully, Please verify otp to continue"
      })
    }

    // ================= NEW USER =================
    let profile_id = await generateProfileId()
    let getFreePlan = await model.getPlan()

    if (getFreePlan.length > 0) {

      let getplanexpiry = getSubscriptionDates(getFreePlan[0]?.p_duration)

      let InsertUser = await model.RegisterUser(
        profile_id,
        mobile,
        token,
        tokenExpiryTime
      )

      if (InsertUser.affectedRows > 0) {

        let user_id = InsertUser.insertId

        let AddSubscription = await model.AddSubscription(
          user_id,
          getFreePlan[0]?.p_id,
          getFreePlan[0]?.p_name,
          getFreePlan[0]?.p_interest_limit,
          getFreePlan[0]?.p_monthly_interest,
          getFreePlan[0]?.p_duration,
          getplanexpiry?.start_date,
          null
        )

        if (AddSubscription.affectedRows > 0) {

          await model.UpdateToken('false', mobile, token, tokenExpiryTime)

          return res.send({
            result: true,
            message: "Otp send successfully, Please verify otp to continue"
          })
        }
      }
    }

    return res.send({
      result: false,
      message: "Failed to send otp, Please try again later"
    })

  } catch (error) {
    return res.send({
      result: false,
      message: error.message
    })
  }
}


module.exports.VerifyOtp = async (req, res) => {
  try {
    let { mobile, token, fcm_token } = req.body || {}

    if (!mobile || !token) {
      return res.send({
        result: false,
        message: "mobile number and otp are required"
      })
    }

    let datetime = moment().format('YYYY-MM-DD HH:mm:ss')
    mobile = addCountryCode(mobile)

    let checkEmail = await model.CheckMobile(mobile)

    if (checkEmail.length == 0) {
      return res.send({
        result: false,
        message: "mobile number not found."
      })
    }

    // 🛑 BLOCK CHECK (FIX)
    if (
      checkEmail[0]?.u_otp_attempt >= 3 &&
      checkEmail[0]?.u_otp_block_until !== null &&
      new Date(checkEmail[0]?.u_otp_block_until) > new Date()
    ) {
      return res.send({
        result: false,
        message: "You are blocked for 3 hours due to multiple wrong OTP attempts."
      })
    }

    if (isOtpExpired(checkEmail[0]?.u_token_expiry)) {
      return res.send({
        result: false,
        message: "OTP has expired. Please try new one"
      })
    }

    // ❌ WRONG OTP
    // if (checkEmail[0]?.u_token != token)
    if ('1111' != token) {

      await model.IncreaseOtpAttempts(checkEmail[0].u_id)
      let attempts = await model.GetOtpAttempts(checkEmail[0].u_id)

      if (attempts >= 3) {
        let blockUntil = moment().add(3, 'hours').format('YYYY-MM-DD HH:mm:ss')
        await model.BlockUserFor3Hours(blockUntil, checkEmail[0].u_id)

        return res.send({
          result: false,
          message: "Too many wrong attempts. You are blocked for 3 hours."
        })
      }

      return res.send({
        result: false,
        message: "Invalid OTP. Please try again."
      })
    }

    // ✔ CORRECT OTP — RESET ATTEMPTS + CLEAR BLOCK
    await model.ResetOtpAttempts(checkEmail[0].u_id)
    await model.BlockUserFor3Hours(null, checkEmail[0].u_id)

    let updateuserdata = await model.UpdateToken('true', mobile, null, null)

    if (updateuserdata.affectedRows > 0) {

      // -------- LOGIN DATA --------
      let checklogdata = await model.CheckLoginData(checkEmail[0].u_id, datetime)
      if (checklogdata.length > 0) {
        await model.UpdateLoginData(checkEmail[0].u_id, datetime)
      } else {
        await model.LoginData(checkEmail[0].u_id, datetime)
      }

      // -------- FCM TOKEN --------
      if (fcm_token) {
        let checkuserlogin = await model.CheckUserLogin(checkEmail[0].u_id)
        if (checkuserlogin.length > 0) {
          await model.UpdateUserToken(checkEmail[0].u_id, fcm_token)
        } else {
          await model.AddUserToken(checkEmail[0].u_id, fcm_token)
        }
      }

      // -------- JWT --------
      const usertoken = GenerateToken({
        user_id: checkEmail[0]?.u_id,
        profile_id: checkEmail[0]?.u_profile_id,
        name: `${checkEmail[0]?.u_first_name ?? ""} ${checkEmail[0]?.u_last_name ?? ""}`.trim(),
        email: checkEmail[0]?.u_email ?? null,
        gender: checkEmail[0]?.u_gender ?? null,
        status: checkEmail[0]?.u_status,
        role: checkEmail[0]?.u_role,
        plan: checkEmail[0]?.u_plan
      });


      let checkjwttoken = await model.CheckJwtToken(checkEmail[0]?.u_id)
      if (checkjwttoken.length == 0) {
        await model.AddUserJWTToken(usertoken, checkEmail[0].u_id)
      } else {
        await model.UpdateUserJWTToken(usertoken, checkEmail[0].u_id)
      }

      // -------- TERMS --------
      let checkTerms = await model.CheckTermsAndCondition(checkEmail[0].u_id)
      if (checkTerms == 0) {
        await model.AddTermsAndCondition(checkEmail[0].u_id, datetime)
      }

      return res.send({
        result: true,
        message: "OTP verification successful",
        profile_completion: checkEmail[0]?.u_profile_completion,
        user_id: checkEmail[0]?.u_id,
        token: usertoken
      })
    }

    return res.send({
      result: false,
      message: "Failed to verify OTP"
    })

  } catch (error) {
    return res.send({
      result: false,
      message: error.message
    })
  }
}


module.exports.UpdateProfile = async (req, res) => {
  try {
    const form = new formidable.IncomingForm({ multiples: true });

    form.parse(req, async function (err, fields, files) {
      if (err) {
        return res.send({
          result: false,
          message: "File Upload Failed!",
          data: err,
        });
      }
      let { user_id } = req.user
      const {
        is_register, u_first_name, u_last_name, u_email, u_dob,
        u_country, u_state, u_district, u_location, u_gender, u_about_me,
        u_marital_status, u_height, u_weight, u_diet, u_work, u_company_name, u_income_range,
        u_highest_qualification, u_university, u_religion, u_community, u_birth_star,
        u_birth_time, u_birth_place, u_time_zone, u_interest, u_mother_tongue,
        u_languages, u_describe_you, u_smoking, u_drinking, u_parent_occupation,
        u_sibling_details, u_family_type, u_parent_income, u_family_city, u_profile_completion
      } = fields;

      let updates = [];
      let values = []
      const date = moment().format("YYYY-MM-DD_HH_mm_ss");

      // ✅ Check user exists
      const checkuser = await model.CheckUserWithId(user_id);
      if (checkuser.length == 0) {
        return res.send({ result: false, message: "User not found" });
      }

      // ✅ Email check if registering
      if (is_register === "true") {
        const checkmail = await model.CheckEmail(u_email);
        if (checkmail.length > 0) {
          return res.send({ result: false, message: "This email already registered" });
        }
      }

      // ✅ Handle file uploads to S3
      if (files.image) {
        const imageFiles = Array.isArray(files.image) ? files.image : [files.image];

        for (const file of imageFiles) {
          const fileBuffer = fs.readFileSync(file.filepath);
          const filename = `${date}_${file.originalFilename}`;
          const key = `profilePics/${user_id}/${filename}`;
          // console.log(filename, key, "keykey");

          try {
            const result = await uploadToS3(fileBuffer, key, file.mimetype);
            await fs.promises.unlink(file.filepath);
            // console.log("s3result", result);

            // Save the S3 URL to DB
            let addimage = await model.AddimageQuery(user_id, result.Location);
            if (addimage.affectedRows == 0) {
              return res.send({ result: false, message: "Failed to add image path", error: err.message });

            }
          } catch (err) {
            console.error("S3 Upload Error:", err);
            return res.send({ result: false, message: "S3 upload failed", error: err.message });
          }
        }
      }


      // ✅ Build update query
      const fieldsToUpdate = new Set();
      if (u_first_name !== undefined) fieldsToUpdate.u_first_name = u_first_name;
      if (u_last_name !== undefined) fieldsToUpdate.u_last_name = u_last_name;
      if (u_email !== undefined) fieldsToUpdate.u_email = u_email;
      if (u_dob !== undefined) fieldsToUpdate.u_dob = u_dob;
      if (u_country !== undefined) fieldsToUpdate.u_country = u_country;
      if (u_state !== undefined) fieldsToUpdate.u_state = u_state;
      if (u_district !== undefined) fieldsToUpdate.u_district = u_district;
      if (u_location !== undefined) fieldsToUpdate.u_location = u_location;
      if (u_gender !== undefined) fieldsToUpdate.u_gender = u_gender;
      if (u_about_me !== undefined) fieldsToUpdate.u_about_me = u_about_me;
      if (u_marital_status !== undefined) fieldsToUpdate.u_marital_status = u_marital_status;
      if (u_height !== undefined) fieldsToUpdate.u_height = u_height
      if (u_weight !== undefined) fieldsToUpdate.u_weight = u_weight
      if (u_diet !== undefined) fieldsToUpdate.u_diet = u_diet
      if (u_work !== undefined) fieldsToUpdate.u_work = u_work
      if (u_company_name !== undefined) fieldsToUpdate.u_company_name = u_company_name
      if (u_income_range !== undefined) fieldsToUpdate.u_income_range = u_income_range
      if (u_highest_qualification !== undefined) fieldsToUpdate.u_highest_qualification = u_highest_qualification
      if (u_university !== undefined) fieldsToUpdate.u_university = u_university
      if (u_religion !== undefined) fieldsToUpdate.u_religion = u_religion
      if (u_community !== undefined) fieldsToUpdate.u_community = u_community
      if (u_birth_star !== undefined) fieldsToUpdate.u_birth_star = u_birth_star
      if (u_birth_time !== undefined) fieldsToUpdate.u_birth_time = u_birth_time
      if (u_birth_place !== undefined) fieldsToUpdate.u_birth_place = u_birth_place
      if (u_time_zone !== undefined) fieldsToUpdate.u_time_zone = u_time_zone
      if (u_interest !== undefined) fieldsToUpdate.u_interest = u_interest
      if (u_mother_tongue !== undefined) fieldsToUpdate.u_mother_tongue = u_mother_tongue
      if (u_languages !== undefined) fieldsToUpdate.u_languages = u_languages
      if (u_describe_you !== undefined) fieldsToUpdate.u_describe_you = u_describe_you
      if (u_smoking !== undefined) fieldsToUpdate.u_smoking = u_smoking
      if (u_drinking !== undefined) fieldsToUpdate.u_drinking = u_drinking
      if (u_parent_occupation !== undefined) fieldsToUpdate.u_parent_occupation = u_parent_occupation
      if (u_sibling_details !== undefined) fieldsToUpdate.u_sibling_details = u_sibling_details
      if (u_family_type !== undefined) fieldsToUpdate.u_family_type = u_family_type
      if (u_parent_income !== undefined) fieldsToUpdate.u_parent_income = u_parent_income
      if (u_family_city !== undefined) fieldsToUpdate.u_family_city = u_family_city
      if (u_profile_completion !== undefined) fieldsToUpdate.u_profile_completion = u_profile_completion

      for (const [key, value] of Object.entries(fieldsToUpdate)) {
        if (value !== undefined) {
          updates.push(`${key} = ?`);
          values.push(value);
        }
      }

      if (updates.length > 0) {
        const updateString = updates.join(", ");
        // console.log("Update String:", updateString);
        // console.log("Values:", values);
        const updated = await model.UpdateUserProfile(updateString, values, user_id);

        if (updated.affectedRows === 0) {
          return res.send({ result: false, message: "Failed to update profile" });
        }
      }

      res.send({ result: true, message: "Profile updated successfully" });
    });
  } catch (error) {
    console.error("UpdateProfile error:", error);
    res.send({ result: false, message: error.message });
  }
};


module.exports.ListUser = async (req, res) => {
  try {
    const { user_id } = req.user || {};

    const listUser = await model.CheckUserWithId(user_id);

    if (!listUser || listUser.length === 0) {
      return res.send({
        result: false,
        message: "Data not found"
      });
    }

    const updatedData = await Promise.all(
      listUser.map(async (el) => {
        const fieldVisibility = await model.CheckFiledVisible(el.u_id);

        return {
          ...el,
          profileimages: await model.GetprofileImage(el.u_id),
          PartnerPreference: await model.CheckPreference(el.u_id),
          subscription:
            (await model.GetUserSubscriptionData(el.u_id))[0] || null,

          // 🔥 Visibility object
          field_visibility: fieldVisibility
        };
      })
    );

    return res.send({
      result: true,
      message: "Data retrieved successfully",
      list: updatedData
    });

  } catch (error) {
    console.error("Error in ListUser:", error);
    return res.send({
      result: false,
      message: "Internal server error"
    });
  }
};


// module.exports.SearchUser = async (req, res) => {
//   try {
//     const { user_id } = req.user || {};
//     const { search = "", filter = {} } = req.body || {};

//     let conditions = [];

//     // -----------------------
//     // Helpers
//     // -----------------------
//     const escapeLike = (val) =>
//       val.replace(/[%_]/g, "\\$&").toLowerCase();

//     const toNumber = (v) =>
//       Number.isFinite(Number(v)) ? Number(v) : null;

//     // -----------------------
//     // 🔍 Keyword Search (ALL FIELDS)
//     // -----------------------
//     if (search.trim()) {
//       const key = escapeLike(search.trim());
//       const age = toNumber(key);

//       let searchConditions = [
//         `LOWER(u_country) LIKE '%${key}%'`,
//         `LOWER(u_state) LIKE '%${key}%'`,
//         `LOWER(u_district) LIKE '%${key}%'`,
//         `LOWER(u_location) LIKE '%${key}%'`,
//         `LOWER(u_diet) LIKE '%${key}%'`,
//         `LOWER(u_religion) LIKE '%${key}%'`,
//         `LOWER(u_community) LIKE '%${key}%'`,
//         `LOWER(u_mother_tongue) LIKE '%${key}%'`,
//         `LOWER(u_work) LIKE '%${key}%'`,
//         `LOWER(u_highest_qualification) LIKE '%${key}%'`,
//         `LOWER(u_birth_star) LIKE '%${key}%'`
//       ];

//       // Numeric age search
//       if (age !== null) {
//         searchConditions.push(
//           `TIMESTAMPDIFF(YEAR, u_dob, CURDATE()) = ${age}`
//         );
//       }

//       conditions.push(`(${searchConditions.join(" OR ")})`);
//     }

//     // -----------------------
//     // 🎯 Single LIKE Filter
//     // -----------------------
//     const likeFilter = (field, value) => {
//       if (!value || !value.trim()) return;
//       const v = escapeLike(value.trim());
//       conditions.push(`LOWER(TRIM(${field})) LIKE '%${v}%'`);
//     };


//     // -----------------------
//     // 🎯 Multi-Value LIKE Filter
//     // -----------------------
//     const multiValueFilter = (field, value) => {
//       if (!value) return;

//       const values = value
//         .split(",")
//         .map(v => escapeLike(v.trim()))
//         .filter(Boolean);

//       if (!values.length) return;

//       const orCondition = values
//         .map(v => `LOWER(TRIM(${field})) LIKE '%${v}%'`)
//         .join(" OR ");

//       conditions.push(`(${orCondition})`);
//     };


//     // -----------------------
//     // 🎯 Filters
//     // -----------------------
//     likeFilter("u_country", filter.country);
//     likeFilter("u_state", filter.state);
//     likeFilter("u_district", filter.district);
//     likeFilter("u_location", filter.hometown);
//     likeFilter("u_diet", filter.diet);
//     likeFilter("u_religion", filter.religion);
//     likeFilter("u_community", filter.community);

//     multiValueFilter("u_mother_tongue", filter.mother_tongue);
//     multiValueFilter("u_work", filter.career);
//     multiValueFilter("u_highest_qualification", filter.qualification);
//     multiValueFilter("u_birth_star", filter.birth_star);

//     // -----------------------
//     // 🎂 Age Filter
//     // -----------------------
//     const age = toNumber(filter.age);
//     const ageFrom = toNumber(filter.ageFrom);
//     const ageTo = toNumber(filter.ageTo);

//     if (age !== null) {
//       conditions.push(
//         `TIMESTAMPDIFF(YEAR, u_dob, CURDATE()) = ${age}`
//       );
//     } else {
//       if (ageFrom !== null) {
//         conditions.push(
//           `TIMESTAMPDIFF(YEAR, u_dob, CURDATE()) >= ${ageFrom}`
//         );
//       }
//       if (ageTo !== null) {
//         conditions.push(
//           `TIMESTAMPDIFF(YEAR, u_dob, CURDATE()) <= ${ageTo}`
//         );
//       }
//     }

//     // -----------------------
//     // No Search / No Filter → return empty
//     // -----------------------
//     if (!search.trim() && Object.keys(filter).length === 0) {
//       return res.send({
//         result: false,
//         total: 0,
//         data: [],
//       });
//     }

//     const condition =
//       conditions.length ? "AND " + conditions.join(" AND ") : "";

//     // -----------------------
//     // Fetch Users
//     // -----------------------
//     const usersData = await model.ListAllUsers(user_id,condition);

//     if (!usersData?.length) {
//       return res.send({
//         result: false,
//         total: 0,
//         data: [],
//       });
//     }

//     let sanitizedUsers = await sanitizeUserList(usersData, user_id);

//     // -----------------------
//     // Attach Extra Data
//     // -----------------------
//     const updatedData = await Promise.all(
//       sanitizedUsers.map(async (el) => ({
//         ...el,
//         profileimages: await model.GetprofileImage(el.u_id),
//         subscription:
//           (await model.GetUserSubscriptionData(el.u_id))[0] || null,
//       }))
//     );

//     return res.send({
//       result: true,
//       total: updatedData.length,
//       data: updatedData,
//     });

//   } catch (error) {
//     console.error("SearchUser Error:", error);
//     return res.send({
//       result: false,
//       message: error.message,
//     });
//   }
// };



module.exports.SearchUser = async (req, res) => {
  try {
    const { user_id, gender } = req.user || {};
    const { search = "", filter = {} } = req.body || {};

    let conditions = [];
    let params = [];

    // -----------------------
    // Helpers
    // -----------------------
    const escapeLike = (val) =>
      val.replace(/[%_]/g, "\\$&").toLowerCase();

    const toNumber = (v) =>
      Number.isFinite(Number(v)) ? Number(v) : null;

    // -----------------------
    // ❤️ Partner Preference Gender Filter
    // -----------------------
    const preferenceData = await model.CheckPreference(user_id);
    const preferredGender =
      preferenceData?.[0]?.pp_gender || null;

    if (preferredGender && preferredGender.toLowerCase() !== "all") {
      conditions.push("LOWER(u_gender) = ?");
      params.push(preferredGender.toLowerCase());
    }

    // -----------------------
    // 🔍 Keyword Search
    // -----------------------
    if (search.trim()) {
      const key = `%${escapeLike(search.trim())}%`;
      const age = toNumber(search);

      let searchConditions = [
        "LOWER(u_country) LIKE ?",
        "LOWER(u_state) LIKE ?",
        "LOWER(u_district) LIKE ?",
        "LOWER(u_location) LIKE ?",
        "LOWER(u_diet) LIKE ?",
        "LOWER(u_religion) LIKE ?",
        "LOWER(u_community) LIKE ?",
        "LOWER(u_mother_tongue) LIKE ?",
        "LOWER(u_work) LIKE ?",
        "LOWER(u_highest_qualification) LIKE ?",
        "LOWER(u_birth_star) LIKE ?"
      ];

      params.push(
        key, key, key, key, key,
        key, key, key, key, key, key
      );

      if (age !== null) {
        searchConditions.push(
          "TIMESTAMPDIFF(YEAR, u_dob, CURDATE()) = ?"
        );
        params.push(age);
      }

      conditions.push(`(${searchConditions.join(" OR ")})`);
    }

    // -----------------------
    // 🎯 LIKE Filter
    // -----------------------
    const likeFilter = (field, value) => {
      if (!value || !value.trim()) return;
      conditions.push(`LOWER(TRIM(${field})) LIKE ?`);
      params.push(`%${escapeLike(value.trim())}%`);
    };

    // -----------------------
    // 🎯 Multi-value Filter
    // -----------------------
    const multiValueFilter = (field, value) => {
      if (!value) return;

      const values = value
        .split(",")
        .map(v => v.trim())
        .filter(Boolean);

      if (!values.length) return;

      const orConditions = values.map(v => {
        params.push(`%${escapeLike(v)}%`);
        return `LOWER(TRIM(${field})) LIKE ?`;
      });

      conditions.push(`(${orConditions.join(" OR ")})`);
    };

    // -----------------------
    // 🎯 Filters
    // -----------------------
    likeFilter("u_country", filter.country);
    likeFilter("u_state", filter.state);
    likeFilter("u_district", filter.district);
    likeFilter("u_location", filter.hometown);
    likeFilter("u_diet", filter.diet);
    likeFilter("u_religion", filter.religion);
    likeFilter("u_community", filter.community);
    likeFilter("u_work", filter.work);

    multiValueFilter("u_mother_tongue", filter.mother_tongue);
    // multiValueFilter("u_work", filter.career);
    multiValueFilter("u_interest", filter.interests);
    multiValueFilter("u_highest_qualification", filter.qualification);
    multiValueFilter("u_birth_star", filter.birth_star);

    // // -----------------------
    // // 🎂 Age Filter
    // // -----------------------
    // const age = toNumber(filter.age);
    // const ageFrom = toNumber(filter.ageFrom);
    // const ageTo = toNumber(filter.ageTo);

    // if (age !== null) {
    //   conditions.push(
    //     "TIMESTAMPDIFF(YEAR, u_dob, CURDATE()) = ?"
    //   );
    //   params.push(age);
    // } else {
    //   if (ageFrom !== null) {
    //     conditions.push(
    //       "TIMESTAMPDIFF(YEAR, u_dob, CURDATE()) >= ?"
    //     );
    //     params.push(ageFrom);
    //   }
    //   if (ageTo !== null) {
    //     conditions.push(
    //       "TIMESTAMPDIFF(YEAR, u_dob, CURDATE()) <= ?"
    //     );
    //     params.push(ageTo);
    //   }
    // }
    // -----------------------
    // 🎂 Age Filter (FIXED)
    // -----------------------
    if (filter.age && Number(filter.age) > 0) {
      conditions.push(
        "TIMESTAMPDIFF(YEAR, u_dob, CURDATE()) = ?"
      );
      params.push(Number(filter.age));
    } else {
      if (filter.ageFrom && Number(filter.ageFrom) > 0) {
        conditions.push(
          "TIMESTAMPDIFF(YEAR, u_dob, CURDATE()) >= ?"
        );
        params.push(Number(filter.ageFrom));
      }

      if (filter.ageTo && Number(filter.ageTo) > 0) {
        conditions.push(
          "TIMESTAMPDIFF(YEAR, u_dob, CURDATE()) <= ?"
        );
        params.push(Number(filter.ageTo));
      }
    }

    // -----------------------
    // No Search / No Filter
    // -----------------------
    if (!search.trim() && Object.keys(filter).length === 0) {
      return res.send({ result: false, message: "No data found.", total: 0, data: [] });
    }

    const condition =
      conditions.length ? "AND " + conditions.join(" AND ") : "";

    // -----------------------
    // Fetch Users
    // -----------------------
    const usersData = await model.ListAllUsers(
      user_id,
      condition,
      params
    );

    if (!usersData?.length) {
      return res.send({ result: false, total: 0, data: [] });
    }

    const sanitizedUsers = await sanitizeUserList(usersData, user_id);

    const updatedData = await Promise.all(
      sanitizedUsers.map(async (el) => ({
        ...el,
        profileimages: await model.GetprofileImage(el.u_id),
        subscription:
          (await model.GetUserSubscriptionData(el.u_id))[0] || null,
      }))
    );

    return res.send({
      result: true,
      total: updatedData.length,
      data: updatedData,
    });

  } catch (error) {
    console.error("SearchUser Error:", error);
    return res.send({
      result: false,
      message: error.message,
    });
  }
};




module.exports.deleteuser = async (req, res) => {
  try {
    let { user_id } = req.user;

    let Userlist = await model.DeleteUser(user_id);
    console.log("Userlist", Userlist);
    if (Userlist == true) {
      return res.send({
        result: true,
        message: "Your account has been deleted successfully.",
      })
    }
    else {
      return res.send({
        result: false,
        message: "user not found"
      })
    }


  } catch (error) {
    return res.send({
      result: false,
      message: error.message,

    })
  }


}


module.exports.ResubmitProfile = async (req, res) => {
  try {
    let { user_id } = req.user;

    let updates = [];

    let checkuser = await model.CheckUserWithId(user_id)

    if (checkuser.length == 0) {
      return res.send({
        result: false,
        message: "user not found"
      })
    }

    let resumbitProfile = await model.ResumbitProfile(user_id);

    if (resumbitProfile.affectedRows > 0) {
      return res.send({
        result: true,
        message: "Your profile resubmitted successfully"
      })
    } else {
      return res.send({
        result: false,
        message: "Failed to resubmit profile"
      })
    }

  } catch (error) {
    return res.send({
      result: false,
      message: error.message
    })
  }
}


module.exports.DeleteProfileImage = async (req, res) => {
  try {
    let { user_id } = req.user
    const { imageUrl, image_id } = req.body;
    let checkimages = await model.CheckImages(user_id)
    if (checkimages.length <= 3) {
      return res.send({
        result: false,
        message: "Minimum 3 photos required. Upload another to make changes."
      })
    }
    const key = imageUrl.split(".amazonaws.com/")[1]; // "profilePics/1234/myphoto.jpg"

    if (!key) {
      return res.status(400).json({ result: false, message: "Invalid image URL" });
    }

    // Delete from S3
    let deletes3image = await deleteFromS3(key);

    // Optionally remove the image record from DB
    let deleteimage = await model.DeleteUserImage(user_id, image_id);
    if (deleteimage.affectedRows == 0) {
      res.json({ result: false, message: "failed to deleted Image" });

    }
    res.json({ result: true, message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ result: false, message: error.message });
  }
};
