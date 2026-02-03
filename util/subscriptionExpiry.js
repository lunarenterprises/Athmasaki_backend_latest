const moment = require("moment");

module.exports.getSubscriptionDates = (days) => {
  const start_date = moment().format("YYYY-MM-DD");
  const end_date = moment().add(days, "days").format("YYYY-MM-DD");
  return { start_date, end_date };
};

