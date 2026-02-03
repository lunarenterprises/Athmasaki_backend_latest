const model = require('../../model/admin/addAdmins')
const { HashPassword } = require('../../util/bcrypt')

module.exports.AddAdmin = async (req, res) => {
    try {

        const { ad_name, ad_email, ad_mobile, ad_password, permissions } = req.body;

        if (!ad_name || !ad_email || !ad_mobile || !ad_password || !Array.isArray(permissions)) {
            return res.send({
                result: false,
                message: "Missing required fields",
            });
        }
        if (!Array.isArray(permissions)) {
            return res.send({
                result: false,
                message: "permission is required or permissions must be an array",
            });
        }

        let checkMobile = await model.CheckMobile(ad_mobile)
        if (checkMobile.length > 0) {

            return res.send({
                result: false,
                message: "This mobile number is already registerd"
            })
        }


        let checkEmail = await model.CheckEmail(ad_email)
        if (checkEmail.length > 0) {

            return res.send({
                result: false,
                message: "This email is already registerd"
            })
        }

        let password = await HashPassword(ad_password)

        // 🔹 Generate admin profile ID
        const prefix = "#ASM";
        const last = await model.checkIfExists();
        let profile_id;

        if (last.length > 0) {
            const lastNum = parseInt(last[0].ad_profile_id.replace(prefix, ""), 10);
            profile_id = prefix + (lastNum + 1);
        } else {
            profile_id = prefix + "100";
        }

        // 🔹 Insert admin
        const result = await model.AddAdmin(profile_id, ad_name, ad_email, ad_mobile, password);

        if (result.affectedRows === 0) {
            return res.send({ result: false, message: "Admin insert failed" });
        }

        const admin_id = result.insertId;

        // 🔹 Map permissions in the controller
        for (let p of permissions) {
            await model.AddPermission(admin_id, p);
        }

        // 🔹 Success
        return res.send({
            result: true,
            message: "Admin details and permissions added successfully",
        });
    } catch (err) {
        console.error(err);
        return res.send({
            result: false,
            message: err.message,
        });
    }
};


module.exports.ListAdmin = async (req, res) => {
    try {
        const admin_id = req.query.admin_id;

        // Build condition safely
        let condition = "";
        if (admin_id) {
            condition = `WHERE ad_id = '${admin_id}'`; // use parameterized query instead of string concat
        }

        // Fetch admins
        const Adminslist = await model.ListAdmin(condition);

        if (!Adminslist || Adminslist.length === 0) {
            return res.send({
                result: false,
                message: "Failed to fetch admin data",
            });
        }

        // Fetch permissions for each admin
        const admindetails = await Promise.all(
            Adminslist.map(async (admin) => {
                const permissions = await model.listPermissions(admin.ad_id);
                return {
                    ...admin,
                    permissions,
                };
            })
        );

        return res.send({
            result: true,
            message: "Data retrieved successfully",
            data: admindetails
        });

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        });
    }
};


module.exports.EditAdmin = async (req, res) => {
    try {
        const { admin_id, ad_name, ad_email, ad_mobile, permissions } = req.body;

        // ------------------- VALIDATION -------------------
        if (!admin_id) {
            return res.send({ result: false, message: "Admin ID is required" });
        }

        if (!Array.isArray(permissions)) {
            return res.send({
                result: false,
                message: "Permissions must be an array",
            });
        }

        // ------------------- SAFE UPDATE (PARAMETERIZED) -------------------
        let updateFields = [];
        let params = [];

        if (ad_name !== undefined) {
            updateFields.push("ad_name = ?");
            params.push(ad_name);
        }
        if (ad_email !== undefined) {
            updateFields.push("ad_email = ?");
            params.push(ad_email);
        }
        if (ad_mobile !== undefined) {
            updateFields.push("ad_mobile = ?");
            params.push(ad_mobile);
        }

        if (updateFields.length > 0) {
            const updateQuery = updateFields.join(", ");
            params.push(admin_id);

            const updated = await model.UpdateAdmin(updateQuery, params);
            if (!updated || updated.affectedRows === 0) {
                return res.send({
                    result: false,
                    message: "Failed to update admin details",
                });
            }
        }

        // ------------------- UPDATE PERMISSIONS (SAFER) -------------------
        await model.DeletePermissionsByAdmin(admin_id);

        if (permissions.length > 0) {
            await Promise.all(
                permissions.map((p) => model.AddPermission(admin_id, p))
            );
        }

        return res.send({
            result: true,
            message: "Admin details and permissions updated successfully",
        });

    } catch (err) {
        console.error(err);
        return res.send({
            result: false,
            message: err.message,
        });
    }
};



module.exports.DeleteAdmin = async (req, res) => {
    try {
        const ad_id = req.query.ad_id;

        if (!ad_id) {
            return res.send({
                result: false,
                message: "Admin ID is required",
            });
        }

        // --------- Check if admin exists ---------
        const admin = await model.CheckAdmin(ad_id);  // Should be parameterized inside model

        if (!admin || admin.length === 0) {
            return res.send({
                result: false,
                message: "Admin not found",
            });
        }

        // --------- Delete admin permissions (optional but cleaner) ---------
        await model.DeletePermissionsByAdmin(ad_id);

        // --------- Delete admin ---------
        const deleted = await model.DeleteAdmin(ad_id); // Should use parameter binding inside model

        if (deleted && deleted.affectedRows > 0) {
            return res.send({
                result: true,
                message: "Admin deleted successfully",
            });
        }

        return res.send({
            result: false,
            message: "Failed to delete admin",
        });

    } catch (error) {
        return res.send({
            result: false,
            message: error.message,
        });
    }
};

