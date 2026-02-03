const permissionModel = require("../model/admin/permisionlist");

module.exports.checkPermission = (permissionKey) => {
    return async (req, res, next) => {
        try {
            const adminId = req.user?.user_id; // assume set from JWT/session

            if (!adminId) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            // ✅ Get all permissions for this admin from the model
            const permissionsData = await permissionModel.getAdminPermissions(adminId);
            const permissions = permissionsData.map(p => p.adp_permission);

            // Check if the required permission exists
            if (!permissions.includes(permissionKey)) {
                return res.status(403).json({ message: "Access denied" });
            }

            next();
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Internal server error" });
        }
    };
};
