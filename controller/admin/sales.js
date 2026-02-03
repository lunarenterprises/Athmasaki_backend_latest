const model = require('../../model/admin/sales');

module.exports.SalesOverview = async (req, res) => {
    try {
        const totalRevenue = await model.TotalRevenue();
        const RevenueByPlan = await model.RevenueByPlanType();
        const monthlyRevenue = await model.MonthlyRevenue();

        return res.send({
            result: true,
            message: "Sales data retrieved",
            total_revenue: totalRevenue,
            RevenueByPlan: RevenueByPlan,
            monthly_revenue: monthlyRevenue
        });
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        });
    }
};


