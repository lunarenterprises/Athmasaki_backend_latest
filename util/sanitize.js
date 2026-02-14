// utils/sanitizer.js
const model = require('../model/user/fieldVsibility');

async function sanitizeUser(user, visibilityMap = {}, currentUserId, plandetails, interestStatus = null) {

  const {
    u_password,
    u_updated_at,
    u_token,
    u_token_expiry,
    u_otp_block_until,
    u_otp_attempt,
    ...rest
  } = user;

  // Apply visibility rules
  // Object.keys(rest).forEach((key) => {
  //   if(visibilityMap[key]==="location"&&visibilityMap[key]===0){
  //     delete rest.co;
  //   }
  //   if (visibilityMap[key] !== undefined && visibilityMap[key] === 0) {
  //     // Field is hidden by visibility map
  //     delete rest[key];
  //   } else {
  //     // Normalize strings
  //     if (typeof rest[key] === "string") {
  //       rest[key] = rest[key].trim().toLowerCase();
  //     }
  //   }
  // });
  const hasVisibilityRules = visibilityMap && Object.keys(visibilityMap).length > 0;

  if (hasVisibilityRules) {
    Object.keys(rest).forEach((key) => {
      if (visibilityMap["location"] === 0) {
        delete rest.u_country
        delete rest.u_district
        delete rest.u_state
        delete rest.u_location
      }
      if (visibilityMap[key] === 0) {
        delete rest[key];
      } else if (typeof rest[key] === "string") {
        rest[key] = rest[key].trim().toLowerCase();
      }
    });
  } else {
    // Just normalize strings
    Object.keys(rest).forEach((key) => {
      if (typeof rest[key] === "string") {
        rest[key] = rest[key].trim().toLowerCase();
      }
    });
  }

  // -----------------------
  // Contact Info Access Logic
  // -----------------------
  let canViewContact = false;

  // Check if contact view is allowed
  // if (plandetails?.p_contact === 1  && interestStatus === "accepted") {
  if (interestStatus === "accepted") {

    canViewContact = true;
  }

  // 2. Pay-per-use check (only if interest accepted)
  // if (!canViewContact && interestStatus === "accepted" && currentUserId && user.u_id) {
  //   const payPerUse = await model.CheckPayPerUser(currentUserId, user.u_id);
  //   if (payPerUse && payPerUse.length > 0) {
  //     canViewContact = true;
  //   }
  // }

  if (!canViewContact) {
    delete rest.u_first_name;
    delete rest.u_last_name;
    delete rest.u_email;
    delete rest.u_mobile;
    delete rest.u_country;
    delete rest.u_state;
    delete rest.u_district;
    delete rest.u_location;
    delete rest.u_company_name;

  }
  return rest;
}

async function sanitizeUserList(users, currentUserId) {
  const visibilitySettings = await model.getVisibilitySettings();

  const results = await Promise.all(
    users.map(async (user) => {
      // Determine user ID key
      const userIdKey = user.u_id || user.user_id || user.id;

      // Check if blocked either way
      const isBlocked = await model.CheckBlock(currentUserId, userIdKey);

      // Check dislike status
      const isDisliked = await model.CheckDislike(currentUserId, userIdKey);
      // console.log(isBlocked, isDisliked, "isBlocked isDisliked", currentUserId, userIdKey);

      // ❌ If blocked or disliked → skip this user
      if (isBlocked.length > 0 || isDisliked.length > 0) {
        return null;
      }

      let checkuserplan = await model.CheckPlan(currentUserId)
      let plandetails = await model.GetPlanDetails(checkuserplan[0]?.u_plan)
      // Get visibility rules for this user
      const userVisibility = visibilitySettings[userIdKey] || {};

      // Get interest status between current user & this user
      const interestStatus = await model.getInterestStatus(currentUserId, userIdKey);
      if (user.images) {
        user.u_images = user.images.split(",");
      } else {
        user.u_images = [];
      }


      // ✅ Sanitize user with rules
      return sanitizeUser(user, userVisibility, currentUserId, plandetails, interestStatus);

    })
  );

  // Remove nulls (blocked/disliked users)
  return results.filter(Boolean);
}


// Helper to calculate age from DOB
function getAge(dob) {
  const birthDate = new Date(dob);
  const ageDiff = Date.now() - birthDate.getTime();
  const ageDate = new Date(ageDiff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

module.exports = {
  sanitizeUser,
  sanitizeUserList,
  getAge
};

