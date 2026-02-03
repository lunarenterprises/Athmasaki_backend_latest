const cron = require('node-cron');
const { Inactivity } = require('./Inactivity');
const { PlanExpiry } = require('./planExpiry');


// cron.schedule('* * * * *', Inactivity); //1 min
cron.schedule('0 */12 * * *', Inactivity); // 12 hr

// cron.schedule('* * * * *', PlanExpiry); //1 min
cron.schedule('0 */12 * * *', PlanExpiry); // 12 hr
