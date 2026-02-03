var model = require('../../model/admin/dashboard');

module.exports.Dashboard = async (req, res) => {
    try {
        let { days = 30 } = req.body || {}

        const ActiveUsers = await model.ActiveUsers();
        const InActiveUsers = await model.InActiveUsers();
        const NewRegistrations = await model.NewRegistrations();
        const ReportedUsers = await model.ReportedUsers();
        const PendingApprovals = await model.PendingApprovalsList();
        const InActiveUserslist = await model.InactiveUsersList(days);


        return res.send({
            result: true,
            message: "data retrieved",
            active_users: ActiveUsers,
            inactiveuser: InActiveUsers,
            new_registrations: NewRegistrations,
            reported_users: ReportedUsers,
            pending_approvals: PendingApprovals,
            inactive_users_list: InActiveUserslist
        });

    } catch (error) {
        return res.send({
            result: false,
            message: error.message,
        });
    }
};
