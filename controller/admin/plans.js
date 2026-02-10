const model = require('../../model/admin/plans')

module.exports.CreatePlan = async (req, res) => {
    try {

        const { name, price, interest_limit, monthly_interest, duration, contact, who_visited, who_liked, who_declined, chat } = req.body

        if (!name || !price) {
            return res.send({
                result: false,
                message: "name, price, interest limit are required"
            })
        }

        const checkplan = await model.CheckPlanname(name)
        if (checkplan.length > 0) {
            return res.send({
                result: false,
                message: "Plan already exists"
            })
        }
        const created = await model.CreatePlan(name, price, interest_limit, monthly_interest, duration, contact, who_visited, who_liked, who_declined, chat)

        if (created.affectedRows > 0) {
            return res.send({
                result: true,
                message: "Subscription Plan created successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to create subscription plan. Please try again later."
            })
        }

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}



// module.exports.ListAllPlans = async (req, res) => {
//     try {
//         const { user_id, role } = req.user || {};

//         const planData = await model.ListAllPlans(); // Get all plans
//         const planUsage = await model.GetUserCountByPlan(); // Get usage per plan

//         let activePlanId = null;

//         // If role is 'user', fetch the user's current active subscription
//         if (role === 'user') {
//             const userSubscription = await model.GetUserActiveSubscription(user_id);

//             if (userSubscription) {
//                 activePlanId = userSubscription[0]?.s_plan_id; // Or appropriate key from the table

//             }
//         }


//         // Map over all plans and enrich with user count and is_active flag
//         const AllPlandetails = planData.map(plan => {
//             const match = planUsage.find(p => p.s_plan_id === plan.p_id);
//             const total_users = match ? match.total_users : 0;

//             const is_active = role == 'user' && plan.p_id == activePlanId;

//             return {
//                 ...plan,
//                 total_users,
//                 is_active
//             };
//         });

//         return res.send({
//             result: true,
//             message: "Data retrieved successfully",
//             data: AllPlandetails
//         });

//     } catch (error) {
//         return res.send({
//             result: false,
//             message: error.message
//         });
//     }
// };

module.exports.ListAllPlans = async (req, res) => {
    try {
        const { user_id, role } = req.user || {};
        let { plan_type } = req.query || {};

        const planData = await model.ListAllPlans(); // Get all plans
        const planUsage = await model.GetUserCountByPlan(); // Get usage per plan

        let activePlanId = null;
        let subscriptionPlanId = null;


        // If role is 'user', fetch the user's current active subscription
        if (role === 'user') {
            const userSubscription = await model.GetUserActiveSubscription(user_id);

            if (userSubscription && userSubscription.length > 0) {
                activePlanId = userSubscription[0]?.s_plan_id;
                subscriptionPlanId = userSubscription[0]?.s_plan_id;
            }

        }

        // Map over all plans and enrich with user count and is_active flag
        let AllPlandetails = planData.map(plan => {
            const match = planUsage.find(p => p.s_plan_id === plan.p_id);
            const total_users = match ? match.total_users : 0;
            const is_active = role === 'user' && plan.p_id === activePlanId;

            return {
                ...plan,
                total_users,
                is_active
            };
        });

        // Filter based on plan_type query
        if (plan_type) {
            plan_type = plan_type.toLowerCase();

            if (plan_type === 'subscription') {
                // Show free + subscription plans
                AllPlandetails = AllPlandetails.filter(
                    plan => ['free', 'subscription'].includes(plan.p_plan_type.toLowerCase())
                );

                // If user already has an active subscription, remove the free plan
                if (!activePlanId || subscriptionPlanId !== 1) {
                    AllPlandetails = AllPlandetails.filter(
                        plan => plan.p_plan_type.toLowerCase() !== 'free'
                    );
                }

            } else if (plan_type === 'payperuse') {
                // Show only payperuse plans
                // AllPlandetails = AllPlandetails.filter(
                //     plan => plan.p_plan_type.toLowerCase() === 'payperuse'
                // );
                AllPlandetails = AllPlandetails.filter(
                    plan => plan.p_plan_type.toLowerCase() !== 'free'
                );
            }
        }

        return res.send({
            result: true,
            message: "Data retrieved successfully",
            data: AllPlandetails
        });

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        });
    }
};


module.exports.EditPlan = async (req, res) => {
    try {
        const { user_id } = req.user || {}
        const { plan_id, name, price, interest_limit, monthly_interest, duration, contact, who_visited, who_liked, who_declined, chat } = req.body
        if (!plan_id) {
            return res.send({
                result: false,
                message: "Subscription Plan id is required"
            })
        }
        const checkPlan = await model.CheckPlan(plan_id)
        if (checkPlan.length === 0) {
            return res.send({
                result: false,
                message: "Subscription Plan data not found."
            })
        }
        let updates = []
        if (name !== undefined) updates.push(`p_name = '${name}'`)
        if (price !== undefined) updates.push(`p_price = '${price}'`)
        if (interest_limit !== undefined) updates.push(`p_interest_limit = '${interest_limit}'`)
        if (monthly_interest !== undefined) updates.push(`p_monthly_interest = '${monthly_interest}'`)
        if (duration !== undefined) updates.push(`p_duration = '${duration}'`)
        if (contact !== undefined) updates.push(`p_contact = '${contact}'`)
        if (who_visited !== undefined) updates.push(`p_who_visited = '${who_visited}'`)
        if (who_liked !== undefined) updates.push(`p_who_liked = '${who_liked}'`)
        if (who_declined !== undefined) updates.push(`p_who_declined = '${who_declined}'`)
        if (chat !== undefined) updates.push(`p_chat = '${chat}'`)

        if (updates.length > 0) {
            const updateString = updates.join(', ');
            const updated = await model.UpdatePlan(updateString, plan_id)
            if (updated.affectedRows === 0) {
                return res.send({
                    result: false,
                    message: "Failed to update Subscription plan"
                })
            }
        }

        return res.send({
            result: true,
            message: "Subscription Plan updated successfully"
        })
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.DeletePlan = async (req, res) => {
    try {
        const { user_id } = req.user || {}

        const { plan_id } = req.query
        if (!plan_id) {
            return res.send({
                result: false,
                message: "Subscription Plan id is required"
            })
        }
        const checkPlan = await model.CheckPlan(plan_id)
        if (checkPlan.length === 0) {
            return res.send({
                result: false,
                message: "Subscription Plan data not found"
            })
        }
        if (checkPlan[0].p_plan_type.toLowerCase() == 'free') {
            return res.send({
                result: false,
                message: "Free plan cannot be deleted"
            })
        }
        if (checkPlan[0].p_plan_type.toLowerCase() == 'payperuse') {
            return res.send({
                result: false,
                message: "Pay per use plan cannot be deleted"
            })
        }

        const deleted = await model.DeletePlan(plan_id)

        if (deleted.affectedRows > 0) {
            return res.send({
                result: true,
                message: "Subscription Plan deleted successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to delete Subscription Plan"
            })
        }

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

