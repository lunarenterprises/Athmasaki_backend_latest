const admin = require('firebase-admin');
const fs = require('fs');
var db = require("../config/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);

// // module.exports.FirebaseSendNotification = async (messages, notifiactionbody, receiver_id) => {
// //     console.log(receiver_id, "receiver_id");

// //     let admin = await initializeFirebase();

// //     // getUser should return a single user object, not an array
// //     let userdata = await getUser(receiver_id);

// //     if (!userdata || !userdata.ft_fcm_token) {
// //         return 'user not logged in yet';
// //     }

// //     const message = {
// //         notification: notifiactionbody,
// //         data: messages,
// //         token: userdata.ft_fcm_token,
// //     };

// //     try {
// //         let response = await admin.messaging().send(message);
// //         console.log(`Notification sent successfully-${receiver_id}:`, response);
// //         return 'Notification sent successfully';
// //     } catch (error) {
// //         console.error('Error sending notification:', error.message);
// //         return error.message;
// //     }
// // };






// //old firebase initialize  ---\/

// // async function initializeFirebase() {
// //     // Delete previous app if it exists
// //     if (currentApp) {
// //         console.log(`Deleting previous app connection: ${currentApp.name}`);
// //         await currentApp.delete();
// //         currentApp = null;
// //     }

// //     // Build service account object from env vars
// //     const serviceAccount = {
// //         type: process.env.FIREBASE_TYPE,
// //         project_id: process.env.FIREBASE_PROJECT_ID,
// //         private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
// //         private_key: process.env.FIREBASE_PRIVATE_KEY,
// //         client_email: process.env.FIREBASE_CLIENT_EMAIL,
// //         client_id: process.env.FIREBASE_CLIENT_ID,
// //         auth_uri: process.env.FIREBASE_AUTH_URI,
// //         token_uri: process.env.FIREBASE_TOKEN_URI,
// //         auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
// //         client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
// //         universe_domain: process.env.UNIVERSE_DOMAIN
// //     };

// //     // Initialize Firebase
// //     currentApp = admin.initializeApp({
// //         credential: admin.credential.cert(serviceAccount),
// //         databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
// //     });

// //     return currentApp;
// // }

// let getUser = async (receiver_id) => {
//     const Query = `SELECT ft_fcm_token FROM fcm_tokens WHERE ft_u_id = ? LIMIT 1`;
//     const data = await query(Query, [receiver_id]);

//     return data && data.length ? data[0] : null;
// };



let firebaseApp;

/* ---------------- FIREBASE INIT ---------------- */
function initializeFirebase() {
    if (firebaseApp) {
        return firebaseApp;
    }

    const serviceAccount = {
        type: process.env.FIREBASE_TYPE,
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,

        // 🔴 critical for env-based keys
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),

        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI,
        token_uri: process.env.FIREBASE_TOKEN_URI,
        auth_provider_x509_cert_url:
            process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    };

    firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });

    console.log("✅ Firebase initialized");
    return firebaseApp;
}

/* ---------------- GET USER ---------------- */
async function getUser(receiver_id) {
    const sql =
        `SELECT ft_fcm_token FROM fcm_tokens WHERE ft_u_id = ? LIMIT 1`
    const data = await query(sql, [receiver_id]);
    return data && data.length ? data[0] : null;
}

/* ---------------- SEND NOTIFICATION ---------------- */
async function FirebaseSendNotification(
    messages,
    notificationBody,
    receiver_id
) {
    try {
        initializeFirebase();

        const user = await getUser(receiver_id);

        if (!user || !user.ft_fcm_token) {
            return "User not logged in / FCM token missing";
        }

        const safeData = Object.fromEntries(
            Object.entries(messages || {}).map(([k, v]) => [k, String(v)])
        );

        const payload = {
            token: user.ft_fcm_token,
            notification: {
                title: notificationBody.title,
                body: notificationBody.body,
                // ✅ add this
                // image: "https://cdn-icons-png.flaticon.com/256/1456/1456503.png"
            },
            // data: safeData,
            android: {
                priority: "high",
                notification: {
                    // image: "https://cdn-icons-png.flaticon.com/256/1456/1456503.png"
                },
            },
            apns: {
                payload: {
                    aps: {
                        sound: "default",
                        badge: 1,
                        "mutable-content": 1, // Required for iOS rich notifications
                    },
                },
            },
        };

        const response = await admin.messaging().send(payload);
        console.log(`✅ Notification sent to ${receiver_id}`, response);
        return "Notification sent successfully";

    } catch (error) {
        console.error("❌ Push error:", error.code);

        // 🔥 IMPORTANT CLEANUP
        if (error.code === "messaging/registration-token-not-registered") {
            await query(
                "DELETE FROM fcm_tokens WHERE ft_u_id = ?",
                [receiver_id]
            );
            console.log(`🧹 Removed invalid FCM token for user ${receiver_id}`);
        }

        return error.message;
    }
}


/* ---------------- EXPORTS ---------------- */
module.exports = {
    FirebaseSendNotification,
    initializeFirebase,
};


