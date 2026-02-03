
const express = require("express");
const cors = require("cors");
const app = express();
const bodyparser = require("body-parser");
const https = require("https");
const http = require("http");
const fs = require("fs");
require("dotenv").config({ encoding: "latin1" });

app.use(bodyparser.urlencoded({ limit: '100mb', extended: true }));

app.use(bodyparser.json());

app.use(cors());
app.use(express.static("./", {
    maxAge: "1d" // Cache images for one day
}));


var userroute = require("./router/userRouter");
var adminroute = require("./router/adminRouter");

app.use("/athmasakhi/user", userroute);
app.use("/athmasakhi/admin", adminroute);

let server;

if (process.env.NODE_ENV == "production") {
    // Hardcoded SSL certificate paths
    const privateKey = fs.readFileSync('/etc/ssl/private.key', 'utf8').toString();
    const certificate = fs.readFileSync('/etc/ssl/certificate.crt', 'utf8').toString();
    const ca = fs.readFileSync('/etc/ssl/ca_bundle.crt', 'utf8').toString();
    const options = { key: privateKey, cert: certificate, ca: ca };
    server = https.createServer(options, app);
    console.log("Running in production with HTTPS");
} else {
    server = http.createServer(app);
    console.log("Running in development with HTTP");
}

const io = require("socket.io")(server, {
    maxHttpBufferSize: 10e7,
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

require('./cron/cronfunctions');
require('./socket/socket')(io);

server.listen(process.env.PORT || 7004, () => {
    console.log(`Server running on port ${process.env.PORT || 7004}`);
});
