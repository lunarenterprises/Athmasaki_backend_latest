const crypto = require("crypto");
const PaymentModel = require("../../model/user/payment");
const { getSubscriptionDates } = require('../../util/subscriptionExpiry')
const Razorpay = require('razorpay');
const { SendNotification } = require("../../util/sendnotification");
let moment = require('moment');

module.exports.PaymentOrderId = async (req, res) => {
    try {
        const { price_id } = req.body;
        if (!price_id) {
            return res.status(400).json({ status: 'error', message: 'Price id is required' });
        }
        let pricedetails = await PaymentModel.validatePlan(price_id);
        if (!pricedetails) {
            return res.status(400).json({ status: 'error', message: 'Price Details not found' });
        }
        let amount = pricedetails[0].p_price;
        const razorpay = new Razorpay({
            //live rzp key
            key_id: process.env.RZP_LIVE_KEY_ID,
            key_secret: process.env.LIVE_RZP_KEY_SECRET,
            // test rzp key
            // key_id: process.env.RZP_TEST_KEY_ID,
            // key_secret: process.env.TEST_RZP_KEY_SECRET,
        });
        const options = {
            amount: Number(amount) * 100, // amount in paisa (100 INR = 10000)
            currency: 'INR',
            receipt: 'receipt_order_' + Math.floor(Math.random() * 100000),
        };

        const order = await razorpay.orders.create(options);
        console.log("order", order);

        if (order) {
            return res.send({
                result: true,
                message: "Order id created sucessfully",
                order_id: order,
                // rzp_key_id: process.env.RZP_LIVE_KEY_ID,
                rzp_key_id: process.env.RZP_TEST_KEY_ID,

            })
        } else {
            return res.send({
                result: false,
                message: "Failed to create user subscription",
                order_id: order
            })
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};


module.exports.processPayment = async (req, res) => {
    try {
        const { user_id, profile_id } = req.user
        console.log("user_id", user_id);
        const { plan_type, plan_id, razorpay_order_id, razorpay_payment_id, razorpay_signature, payment_status, receiver_id } = req.body;

        // Validate request
        if (!plan_type || !plan_id || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        let pricedetails = await PaymentModel.validatePlan(plan_id);
        if (!pricedetails) {
            return res.status(400).json({ status: 'error', message: 'Price Details not found' });
        }

        let amount = pricedetails[0].p_price;

        let today = moment().format('YYYY-MM-DD');
        // ------------------ VALIDATE USER ------------------
        const user = await PaymentModel.validateUser(user_id);
        if (!user) return res.status(400).json({ success: false, message: "Invalid user_id" });

        // ------------------ VALIDATE PLAN ------------------
        if (plan_type !== "subscription" && plan_type !== "addon" && plan_type !== "payperuse") {
            return res.status(400).json({ success: false, message: "Invalid plan_type. Must be 'subscription' or 'payperuse'" });
        }

        let plan
        if (plan_type == "subscription") {

            plan = await PaymentModel.validatePlan(plan_id);
            if (!plan) return res.status(400).json({ success: false, message: "Plan details not found / Invalid plan_id for the given plan_type" });

        } else if (plan_type == "addon") {

            plan = await PaymentModel.validateAddonPlan(plan_id);
            if (!plan) return res.status(400).json({ success: false, message: "Plan details not found / Invalid plan_id for the given plan_type" });

        } else if (plan_type == "payperuse") {

            plan = await PaymentModel.validatePlan(plan_id);
            if (!plan) return res.status(400).json({ success: false, message: "Plan details not found / Invalid plan_id for the given plan_type" });
        }

        // ------------------ VERIFY PAYMENT ------------------
        //test rzp key

        const hmac = crypto.createHmac("sha256", process.env.RZP_TEST_KEY_ID);

        //live rzp key
        // const hmac = crypto.createHmac("sha256", process.env.RZP_LIVE_KEY_ID);

        hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
        const generated_signature = hmac.digest("hex");

        // let status;
        let status = "success";

        if (generated_signature === razorpay_signature) status = "success";

        // ------------------ SAVE PAYMENT ------------------
        let getplanexpiry
        if (plan_type == "subscription") {
            if (plan[0]?.p_duration !== null && plan[0]?.p_duration !== undefined) {
                getplanexpiry = getSubscriptionDates(plan[0]?.p_duration)

            }
        }

        const paymentId = await PaymentModel.AddPayment(
            user_id,
            plan_type,
            plan_id,
            amount,
            order_id = razorpay_order_id,
            payment_id = razorpay_payment_id,
            signature = razorpay_signature,
            verify_status = status,
            payment_status);

        console.log(plan[0]?.p_duration, getplanexpiry?.start_date, getplanexpiry?.end_date);

        if (status === "success") {

            if (plan_type == "subscription") {

                let updatesubscription = await PaymentModel.UpdateUserSubscription(user_id, plan_id, plan[0]?.p_name, amount, plan[0]?.p_interest_limit, plan[0]?.p_monthly_interest, plan[0]?.p_duration, getplanexpiry?.start_date ? getplanexpiry?.start_date : today, getplanexpiry?.end_date)
                if (updatesubscription.affectedRows === 0) {
                    return res.send({
                        result: false,
                        message: "Failed to update user subscription"
                    })
                } else {
                    let updateuserplanid = await PaymentModel.UpdateUserPlanId(user_id, plan_id)
                    if (updateuserplanid.affectedRows === 0) {
                        return res.send({
                            result: false,
                            message: "Failed to update user plan"
                        })
                    }
                }

            } else if (plan_type == "addon") {

                let updatesubscription = await PaymentModel.UpdateUserAddOnSubscription(user_id, plan[0]?.ap_interest)
                if (updatesubscription.affectedRows === 0) {
                    return res.send({
                        result: false,
                        message: "Failed to update user subscription"
                    })
                }
            } else if (plan_type == "payperuse") {

                if (!receiver_id) {
                    return res.send({
                        result: false,
                        message: "Receiver id is required"
                    })
                }

                const receiverData = await PaymentModel.CheckReceiver(receiver_id)
                if (receiverData.length === 0) {
                    return res.send({
                        result: false,
                        message: "User not found. Cannot send request"
                    })
                }

                let checkinterestlimit = await PaymentModel.CheckInterestLimit(user_id)

                if (checkinterestlimit.length > 0) {

                    if (checkinterestlimit[0]?.s_interest_limit > 0) {
                        return res.send({
                            result: false,
                            message: "You have active plan or sufficient interest limit to send interest requests. Please use that first."
                        })
                    }
                }

                const checkAlreadySend = await PaymentModel.CheckInterestSended(user_id, receiver_id)
                if (checkAlreadySend.length > 0) {
                    return res.send({
                        result: false,
                        message: "Already sent interest request to this user"
                    })
                }

                const sended = await PaymentModel.SendInterest(user_id, receiver_id)
                if (sended.affectedRows > 0) {

                    await SendNotification({
                        sender_id: user_id,
                        receiver_id,
                        message: `You’ve received new interest ❤️`,
                        type: "interestRequest",
                    });

                    return res.send({
                        result: true,
                        message: "Interest sent successfully"
                    })

                } else {
                    return res.send({
                        result: false,
                        message: "Failed to send interest. Please try again later"
                    })
                }
            }

            return res.send({
                result: true,
                message: "Payment successful",
            })

        } else {
            return res.send({
                result: false,
                message: "Payment failed",
            })
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports.PaymentHistory = async (req, res) => {
    try {
        const payments = await PaymentModel.getAllPayments();
        if (payments.length === 0) {
            return res.send({
                result: false,
                message: "No payment history found"
            })
        }

        const AllPaymentsDetails = await Promise.all(
            payments.map(async (payment) => {
                const user = await PaymentModel.getUserById(payment.ph_plan_id);
                const plan = await PaymentModel.getPlanById(payment.ph_plan_type, payment.ph_plan_id);

                return {
                    ...payment,
                    user: user,
                    plan_details: plan
                };
            })
        );

        return res.send({
            result: true,
            message: "Data retrieved successfully",
            data: AllPaymentsDetails
        })

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}



