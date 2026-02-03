var model = require('../model/user/sendnotification')
var moment = require('moment')
const { FirebaseSendNotification } = require("./firebase");



// module.exports.SendNotification = async ({ sender_id, receiver_id, message, type }) => {
//   try {
//     const date = moment().format("YYYY-MM-DD");
//     const time = moment().format("HH:mm:ss");

//     if (!message || !receiver_id) {
//       return {
//         result: false,
//         message: "insufficient parameters",
//       };
//     }

//     const notifiactionbody = { body: message };

//     const messages = {
//       message,
//       type,
//       message_date: date,
//       message_time: time,
//     };

//     await firebasenotification.FirebaseSendNotification(
//       { screen: "chat", chatId: 123 },
//       { title: "New Message", body: "You have a new message" },
//       receiver_id
//     )
//     // const send = await firebasenotification.FirebaseSendNotification(messages, notifiactionbody, receiver_id);
//     const addnotification = await model.AddNotification(sender_id, receiver_id, message, type, date, time);

//     if (addnotification.affectedRows > 0) {
//       return {
//         result: true,
//         message: send,
//       };
//     } else {
//       return {
//         result: false,
//         message: "failed to send notification",
//       };
//     }
//   } catch (error) {
//     console.error(error);
//     return {
//       result: false,
//       message: error.message,
//     };
//   }
// };

module.exports.SendNotification = async ({ sender_id, receiver_id, message, type }) => {
  try {
    if (sender_id == null || !receiver_id || !message) {
      return {
        result: false,
        message: "insufficient parameters",
      };
    }

    const date = moment().format("YYYY-MM-DD");
    const time = moment().format("HH:mm:ss");

    // Send Firebase notification
    const send = await FirebaseSendNotification(
      { screen: "chat", chatId: 123 },
      { title: "New Message", body: message },
      receiver_id
    );

    // const send = await firebasenotification.FirebaseSendNotification(messages, notifiactionbody, receiver_id);

    // Save notification in DB
    const addnotification = await model.AddNotification(
      sender_id,
      receiver_id,
      message,
      type,
      date,
      time
    );

    if (addnotification?.affectedRows > 0) {
      return {
        result: true,
        message: send || "notification sent",
      };
    }

    return {
      result: false,
      message: "failed to save notification",
    };

  } catch (error) {
    console.error("SendNotification error:", error);
    return {
      result: false,
      message: error.message,
    };
  }
};
