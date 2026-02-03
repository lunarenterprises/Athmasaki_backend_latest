const model = require('../../model/user/matches')
const { sanitizeUserList, getAge } = require("../../util/sanitize");


module.exports.FindMatchingUsers = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { page = 1, limit = 10, search = "", filter = {} } = req.body || {};

    const currentPage = parseInt(page);
    const perPage = parseInt(limit);

    // -----------------------
    // 1. Partner Preference
    // -----------------------
    const partnerPref = await model.GetPartnerPreference(user_id);
    if (!partnerPref || !partnerPref.length) {
      return res.status(404).send({
        result: false,
        message: "Partner preference not found"
      });
    }
    const pref = partnerPref[0];

    // -----------------------
    // 2. Existing Matches 
    // -----------------------
    const existingMatches = await model.GetMatchedUserIds(user_id);

    const excludeIds = [
      ...existingMatches.map(m => m.m_matched_user_id),
    ].filter(Boolean);

    // -----------------------
    // 3. Get Users
    // -----------------------
    let users = await model.GetAllUsersExcept(user_id, excludeIds);

    // -----------------------
    // Helpers
    // -----------------------
    const normalize = (str) => str?.toString().trim().toLowerCase();
    const normalizeList = (val) =>
      typeof val === "string"
        ? val.split(",").map(v => v.trim().toLowerCase()).filter(Boolean)
        : [];
    const inList = (val, list) => list.includes(normalize(val));

    // -----------------------
    // 4. Score Users
    // -----------------------
    const scoredUsers = users
      .filter(u => normalize(u.u_gender) === normalize(pref.pp_gender))
      .map(user => {
        let score = 0;
        const age = getAge(user.u_dob);

        if (
          pref.pp_from_age &&
          pref.pp_to_age &&
          age >= pref.pp_from_age &&
          age <= pref.pp_to_age
        ) score++;

        if (inList(user.u_religion, normalizeList(pref.pp_religion))) score++;
        if (inList(user.u_community, normalizeList(pref.pp_community))) score++;
        if (inList(user.u_country, normalizeList(pref.pp_country))) score++;
        if (inList(user.u_state, normalizeList(pref.pp_state))) score++;
        if (inList(user.u_district, normalizeList(pref.pp_district))) score++;
        if (inList(user.u_highest_qualification, normalizeList(pref.pp_education))) score++;
        if (inList(user.u_work, normalizeList(pref.pp_profession))) score++;
        if (inList(user.u_smoking, normalizeList(pref.pp_smoking))) score++;
        if (inList(user.u_drinking, normalizeList(pref.pp_drinking))) score++;

        return { ...user, match_score: score };
      });

    // -----------------------
    // 5. SAVE MATCHES (NO DUPLICATES)
    // -----------------------
    for (const u of scoredUsers) {
      const exists = await model.MatchExists(user_id, u.u_id);
      if (!exists) {
        await model.SaveMatch(user_id, u.u_id, u.match_score);
      }
    }

    // -----------------------
    // 6. FETCH MATCHES
    // -----------------------
    let allMatches = await model.GetAllMatches(user_id);

    // -----------------------
    // 6a. EXCLUDE USERS ALREADY SENT INTEREST
    // -----------------------
    const sentInterests = await model.GetInterestSentUserIds(user_id);
    const sentInterestIds = sentInterests
      .map(i => i.i_receiver_id)
      .filter(Boolean);

    allMatches = allMatches.filter(
      user => !sentInterestIds.includes(user.u_id)
    );

    // -----------------------
    // ✅ 6b. EXCLUDE ACCEPTED INTEREST USERS (FROM INTEREST TABLE)
    // -----------------------
    const acceptedInterests = await model.GetAcceptedInterestUserIds(user_id);
    const acceptedIds = acceptedInterests
      .map(i =>
        i.i_sender_id === user_id ? i.i_receiver_id : i.i_sender_id
      )
      .filter(Boolean);

    allMatches = allMatches.filter(
      user => !acceptedIds.includes(user.u_id)
    );

    // -----------------------
    // 7. FILTER
    // -----------------------
    allMatches = allMatches.filter(user => {
      const age = getAge(user.u_dob);

      if (filter.age && age !== filter.age) return false;
      if (filter.ageFrom && age < filter.ageFrom) return false;
      if (filter.ageTo && age > filter.ageTo) return false;

      if (filter.religion && normalize(user.u_religion) !== normalize(filter.religion)) return false;
      if (filter.community && normalize(user.u_community) !== normalize(filter.community)) return false;

      if (search.trim()) {
        const key = search.toLowerCase();
        return (
          user.u_work?.toLowerCase().includes(key) ||
          user.u_location?.toLowerCase().includes(key) ||
          user.u_district?.toLowerCase().includes(key) ||
          user.u_religion?.toLowerCase().includes(key)
        );
      }

      return true;
    });

    // -----------------------
    // 8. PAGINATION
    // -----------------------
    const start = (currentPage - 1) * perPage;
    const paginatedUsers = allMatches.slice(start, start + perPage);

    const sanitized = await sanitizeUserList(paginatedUsers, user_id);

    for (const u of sanitized) {
      u.profileimages = await model.GetprofileImage(u.u_id);
    }

    // -----------------------
    // 9. RESPONSE
    // -----------------------
    return res.send({
      result: true,
      pagination: {
        total: allMatches.length,
        page: currentPage,
        limit: perPage,
        totalPages: Math.ceil(allMatches.length / perPage)
      },
      data: sanitized
    });

  } catch (error) {
    console.error("FindMatchingUsers Error:", error);
    return res.status(500).send({
      result: false,
      message: error.message || "Server error"
    });
  }
};




module.exports.ListAcceptedMatches = async (req, res) => {
  try {
    const { user_id } = req.user

    let interestData = await model.ListInterests(user_id)

    let updatedUser = await sanitizeUserList(interestData, user_id);

    if (updatedUser.length > 0) {
      let ListInterests = await Promise.all(
        updatedUser.map(async (el) => {
          el.profileimages = await model.GetprofileImage(el.u_id);
          return el;
        })
      );

      return res.send({
        result: true,
        message: "Data retrieved successfully",
        data: ListInterests
      })

    } else {
      return res.send({
        result: true,
        message: "No accepted matches found",
      })
    }

  } catch (error) {
    return res.send({
      result: false,
      message: error.message
    })
  }
}
