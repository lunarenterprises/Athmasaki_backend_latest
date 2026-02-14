const axios = require('axios')

module.exports.sendSMS = async (mobile, token) => {
  try {
    const url = "https://control.msg91.com/api/v5/flow/";
    const response = await axios.post(
      url,
      {
        flow_id: process.env.SMS_TEMPLATE_ID, // DLT template ID (required for Indian routes)
        sender: process.env.SMS_SENDER_ID,
        mobiles: mobile,
        // var1: token,
        numeric: token,
      },
      {
        headers: {
          authkey: process.env.SMS_AUTH_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("SMS Sent:", response);
    return response.data;

  } catch (error) {
    console.error("Error sending SMS:", error.response?.data || error.message);
    throw error;
  }
};

module.exports.sendPasswordResetSMS = async (mobile, token) => {
  try {
    const url = "https://control.msg91.com/api/v5/flow/";
    const response = await axios.post(
      url,
      {
        flow_id: process.env.SMS_RESET_TEMPLATE_ID, // DLT template ID (required for Indian routes)
        sender: process.env.SMS_SENDER_ID,
        mobiles: mobile,
        var1: token,
      },
      {
        headers: {
          authkey: process.env.SMS_AUTH_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("SMS Sent:", response);
    return response.data;

  } catch (error) {
    console.error("Error sending SMS:", error.response?.data || error.message);
    throw error;
  }
};


module.exports.formatPhoneNumber = (phone, defaultCountryCode = '+91') => {

  if (!phone) return null;

  phone = phone.trim().replace(/[\s-]/g, '');

  // If number already starts with '+', assume it's in E.164 format
  if (phone.startsWith('+')) {
    return phone;
  }

  // If number starts with '0', remove it
  if (phone.startsWith('0')) {
    phone = phone.substring(1);
  }
  // Add country code
  return defaultCountryCode + phone;
}



// module.exports.sendSMS = async (mobile, message) => {
//   try {
//     const url = "https://api.msg91.com/api/v2/sendsms";

//     const payload = {
//       sender: process.env.SMS_SENDER_ID || "ATHMSK", // your approved sender ID
//       route: "4",                                   // "4" = transactional route
//       country: "91",
//       sms: [
//         {
//           message: message,                         // your custom message
//           to: [9497042580]                              // must include country code
//         }
//       ]
//     };

//     const headers = {
//       authkey: process.env.SMS_AUTH_KEY,            // your MSG91 auth key
//       "Content-Type": "application/json"
//     };

//     const response = await axios.post(url, payload, { headers });

//     console.log("✅ SMS Sent Successfully:", response.data);
//     return response.data;
//   } catch (error) {
//     console.error("❌ Error sending SMS:", error.response?.data || error.message);
//     throw error;
//   }
// };

module.exports.normalizeIndianNumber = function (number) {
  // Remove spaces, dashes, etc.
  number = number.replace(/\s+/g, '').replace(/-/g, '');

  // Remove + if exists
  if (number.startsWith('+')) {
    number = number.substring(1);
  }

  // If starts with 91 and length is correct, keep it
  if (number.startsWith('91') && number.length === 12) {
    return number;
  }

  // If only 10-digit number, add 91
  if (number.length === 10) {
    return '91' + number;
  }

  return number; // fallback
}