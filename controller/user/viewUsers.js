const model = require('../../model/user/viewUsers')
const { sanitizeUserList, getAge } = require('../../util/sanitize')
const { GenerateToken } = require('../../util/jwt')

module.exports.AllUsers = async (req, res) => {
    try {
        const user_id = req?.user?.user_id;

        let {
            page = 1,
            limit = 10,
            search = "",
            filter = {}
        } = req.body || {};

        page = parseInt(page);
        limit = parseInt(limit);

        // -----------------------
        // 0. Get logged-in user
        // -----------------------
        const loggedUser = await model.ListAllUsers(user_id);
        if (!loggedUser) {
            return res.send({ result: false, message: "User not found" });
        }

        const myGender = loggedUser.u_gender?.toLowerCase();
        const oppositeGender = myGender === "male" ? "female" : "male";

        // -----------------------
        // 1. Get all users
        // -----------------------
        const usersData = await model.GetAllUsers();

        // -----------------------
        // 1. SANITIZE USER DATA
        // -----------------------
        let sanitizedUsers = await sanitizeUserList(usersData, user_id);
        if (!Array.isArray(sanitizedUsers)) sanitizedUsers = [sanitizedUsers];

        const normalize = (str) =>
            (str ? str.toString().trim().toLowerCase() : "");

        // -----------------------
        // 2. REMOVE logged-in user
        // -----------------------
        sanitizedUsers = sanitizedUsers.filter(u => u.u_id !== user_id);

        // -----------------------
        // 3. ONLY SHOW OPPOSITE GENDER
        // -----------------------
        let filteredUsers = sanitizedUsers.filter(u =>
            normalize(u.u_gender) === normalize(oppositeGender)
        );

        // -----------------------
        // 4. Apply Filters
        // -----------------------
        // CHECK IF ANY FILTER IS PRESENT
        const hasFilter =
            filter.ageFrom ||
            filter.ageTo ||
            filter.age ||
            filter.religion ||
            filter.community ||
            filter.district ||
            filter.current_location ||
            filter.work ||
            filter.qualification;


        if (hasFilter) {
            filteredUsers = sanitizedUsers.filter(user => {
                const age = getAge(user.u_dob);

                // AGE RANGE
                if (filter.ageFrom && age < filter.ageFrom) return false;
                if (filter.ageTo && age > filter.ageTo) return false;

                // EXACT AGE
                if (filter.age && age !== filter.age) return false;

                // Religion
                if (filter.religion &&
                    normalize(user.u_religion) !== normalize(filter.religion))
                    return false;

                // Community
                if (filter.community &&
                    normalize(user.u_community) !== normalize(filter.community))
                    return false;

                // District
                if (filter.district &&
                    !user.u_district?.toLowerCase().includes(filter.district.toLowerCase()))
                    return false;

                // Location
                if (filter.current_location &&
                    !user.u_location?.toLowerCase().includes(filter.current_location.toLowerCase()))
                    return false;

                // Work
                if (filter.work &&
                    !user.u_work?.toLowerCase().includes(filter.work.toLowerCase()))
                    return false;

                // Qualification
                if (filter.qualification &&
                    !user.u_highest_qualification?.toLowerCase().includes(filter.qualification.toLowerCase()))
                    return false;

                return true;
            });
        }

        console.log("filteredUsers", filteredUsers);

        // -----------------------
        // 5. Apply Search
        // -----------------------
        if (search.trim()) {
            const keyword = search.toLowerCase().trim();

            filteredUsers = filteredUsers.filter((user) =>
                user.u_name?.toLowerCase().includes(keyword) ||
                user.u_location?.toLowerCase().includes(keyword) ||
                user.u_district?.toLowerCase().includes(keyword) ||
                user.u_religion?.toLowerCase().includes(keyword) ||
                user.u_community?.toLowerCase().includes(keyword) ||
                user.u_highest_qualification?.toLowerCase().includes(keyword) ||
                user.u_work?.toLowerCase().includes(keyword) ||
                user.u_profession_area?.toLowerCase().includes(keyword)
            );
        }

        // -----------------------
        // 6. Pagination
        // -----------------------
        const startIndex = (page - 1) * limit;
        const paginated = filteredUsers.slice(startIndex, startIndex + limit);
        console.log("paginated", paginated);

        // -----------------------
        // 7. Add Images + Subscription Data
        // -----------------------
        const finalData = await Promise.all(
            paginated.map(async (user) => {
                let profileimages = await model.GetprofileImage(user.u_id);
                let subscriptionData = await model.GetUserSubscriptionData(user.u_id);

                return {
                    ...user,
                    profileimages,
                    subscription: subscriptionData[0] || null
                };
            })
        );

        // -----------------------
        // 8. Send Response
        // -----------------------
        return res.send({
            result: true,
            message: "Users fetched successfully",
            pagination: {
                page,
                limit,
                total: filteredUsers.length,
                totalPages: Math.ceil(filteredUsers.length / limit),
            },
            data: finalData
        });

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        });
    }
};

module.exports.ViewUsers = async (req, res) => {
    try {
        const user_id = req?.user?.user_id

        let { u_id } = req.body || {}

        const usersData = await model.ListAllUsers(u_id);
        console.log("usersData", usersData);

        let sanitizedUsers = await sanitizeUserList(usersData, user_id) || [];
        console.log("sanitizedUsers", sanitizedUsers);

        if (!Array.isArray(sanitizedUsers)) {
            sanitizedUsers = [sanitizedUsers];
        }

        const updatedData = await Promise.all(
            sanitizedUsers.map(async (user) => {
                const userSubscriptionData = await model.GetUserSubscriptionData(user?.u_id);
                let profileimages = await model.GetprofileImage(user?.u_id);
                return { ...user, profileimages, subscription: userSubscriptionData[0] || null };
            })
        );

        return res.send({
            result: true,
            message: "Data retrieved successfully",
            data: updatedData
        })
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.ViewProfile = async (req, res) => {
    try {
        const { user_id, reset_token } = req?.body || {};
        if (!user_id) {
            return res.send({
                result: false,
                message: "User id is required"
            });
        }
        let token
        // Fetch user data
        const usersData = await model.ViewUsers(user_id);

        if (usersData.length > 0) {
            // Fetch user visibility settings
            const visibilityData = await model.GetUserVisibilityData(user_id);

            // Build visibility map
            const visibilityMap = {};
            visibilityData.forEach(v => {
                visibilityMap[v.dv_field_name] = Boolean(v.dv_is_visible);  /* if dv_is_visible 1 (visible) = true, dv_is_visible 0 (visible) =false */

            });

            // Merge profile images and visibility flags into user data
            const updatedData = await Promise.all(
                usersData.map(async (user) => {
                    const profileimages = await model.GetprofileImage(user?.u_id);

                    const visibilityKeys = {};
                    Object.keys(visibilityMap).forEach(field => {
                        visibilityKeys[`${field}_is_visible`] = visibilityMap[field];
                        // Optionally mask non-visible fields
                        if (!visibilityMap[field] && user[field] !== undefined) {
                            user[field] = null;
                        }
                    });

                    return { ...user, ...visibilityKeys, profileimages };
                })
            );

            if (usersData[0].u_status === 'Pending') {

                if (reset_token == true) {

                    token = GenerateToken({
                        user_id: usersData[0]?.u_id,
                        name: `${usersData[0]?.u_first_name || ""} ${usersData[0]?.u_last_name || ""}`,
                        email: usersData[0]?.u_email,
                        status: usersData[0]?.u_status,
                        role: usersData[0]?.u_role,
                        plan: usersData[0]?.u_plan
                    });

                    var adduserjwttoken
                    let checkjwttoken = await model.CheckJwtToken(usersData[0]?.u_id)
                    console.log("view user checkjwttoken", checkjwttoken);

                    if (checkjwttoken.length == 0) {
                        adduserjwttoken = await model.AddUserJWTToken(token, usersData[0].u_id)
                        console.log("view user  AddUserJWTToken", adduserjwttoken);

                    } else {
                        adduserjwttoken = await model.UpdateUserJWTToken(token, usersData[0].u_id)
                        console.log("view user UpdateUserJWTToken", adduserjwttoken);

                    }

                    if (adduserjwttoken.affectedRows == 0) {
                        return res.send({
                            result: false,
                            message: "Failed to add user token. Please try again."
                        })
                    }
                }
                console.log("token in view profile in if : ", token)
                return res.send({
                    result: true,
                    message: "Your profile is under verification. Please wait for admin approval.",
                    data: updatedData,
                    token: token ? token : null,
                    profile_completion: usersData[0]?.u_profile_completion
                });

            } else {

                if (reset_token == true) {

                    token = GenerateToken({
                        user_id: usersData[0]?.u_id,
                        profile_id: usersData[0]?.u_profile_id,
                        name: `${usersData[0]?.u_first_name || ""} ${usersData[0]?.u_last_name || ""}`,
                        email: usersData[0]?.u_email,
                        gender: usersData[0]?.u_gender ?? null,
                        status: usersData[0]?.u_status,
                        role: usersData[0]?.u_role,
                        plan: usersData[0]?.u_plan
                    });


                    var adduserjwttoken
                    let checkjwttoken = await model.CheckJwtToken(usersData[0]?.u_id)
                    console.log("view user checkjwttoken", checkjwttoken);

                    if (checkjwttoken.length == 0) {
                        adduserjwttoken = await model.AddUserJWTToken(token, usersData[0].u_id)
                        console.log("view user  AddUserJWTToken", adduserjwttoken);

                    } else {
                        adduserjwttoken = await model.UpdateUserJWTToken(token, usersData[0].u_id)
                        console.log("view user UpdateUserJWTToken", adduserjwttoken);

                    }

                    if (adduserjwttoken.affectedRows == 0) {
                        return res.send({
                            result: false,
                            message: "Failed to add user token. Please try again."
                        })
                    }
                }
                console.log("token in view profile in else : ", token)
                return res.send({
                    result: true,
                    message: "Data retrieved successfully",
                    data: updatedData,
                    token: token ? token : null,
                    profile_completion: usersData[0]?.u_profile_completion

                });
            }

        } else {
            return res.send({
                result: false,
                message: "User data not found"
            });
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        });
    }
};


module.exports.ListWorkLocationQualification = async (req, res) => {
    try {

        return res.send({
            result: false,
            message: "This api is not available for the moment",
        });

        let ListUsersLocation = await model.ListUsersLocation();
        let ListUsersWorks = await model.ListUsersWorks();
        let ListUsersQualification = await model.ListUsersQualification();

        // Map the results to arrays of strings
        ListUsersLocation = ListUsersLocation.map(item => item.u_location);
        ListUsersWorks = ListUsersWorks.map(item => item.u_work);
        ListUsersQualification = ListUsersQualification.map(item => item.u_highest_qualification);

        return res.send({
            result: true,
            message: "Data retrieved successfully",
            ListUsersLocation,
            ListUsersWorks,
            ListUsersQualification
        });

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        });
    }
}

