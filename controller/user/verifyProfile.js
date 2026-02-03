let model = require('../../model/user/verifyProfile')
const formidable = require("formidable");
const path = require('path')
const fs = require('fs')
const moment = require("moment");
const { uploadToS3, deleteFromS3 } = require("../../util/ImageUpload");
const { SendNotification } = require("../../util/sendnotification");

module.exports.VerifyProfile = async (req, res) => {
    try {
        const form = new formidable.IncomingForm({ multiples: false });

        form.parse(req, async function (err, fields, files) {
            if (err) {
                return res.send({
                    result: false,
                    message: "File Upload Failed!",
                    data: err,
                });
            }

            const { user_id } = req.user;
            console.log("verify-user", req.user);

            // Check user exists
            const checkuser = await model.CheckUserWithId(user_id);
            if (checkuser.length === 0) {
                return res.send({ result: false, message: "User not found" });
            }

            if (checkuser[0]?.u_verify_profile == 'verified') {
                return res.send({
                    result: false,
                    message: "Your Profile is already verified",
                });
            }
            // ---------------------------------------------------
            //     ONLY SELFIE UPLOAD FOR VERIFICATION
            // ---------------------------------------------------

            if (!files.selfie) {
                return res.send({
                    result: false,
                    message: "Selfie image is required!",
                });
            }

            const file = files.selfie;
            console.log("verify-user file", file);

            const fileBuffer = fs.readFileSync(file.filepath);
            const filename = `selfi_${Date.now()}_${file.originalFilename}`;
            const key = `selfie/${user_id}/${filename}`;

            try {
                // Upload selfie to S3
                const result = await uploadToS3(fileBuffer, key, file.mimetype);

                // Remove temp file
                await fs.promises.unlink(file.filepath);

                const selfieUrl = result.Location;

                // ---------------------------------------------------
                //   SAVE SELFIE URL + SET VERIFY STATUS = 'pending'
                // ---------------------------------------------------

                const updated = await model.UpdateUserProfile(selfieUrl, user_id);

                if (updated.affectedRows === 0) {
                    return res.send({
                        result: false,
                        message: "Failed to update verification data",
                    });
                }

                return res.send({
                    result: true,
                    message: "Selfie uploaded, verification is pending.",
                    selfie_url: selfieUrl
                });

            } catch (err) {
                console.error("Selfie Upload Error:", err);
                return res.send({
                    result: false,
                    message: "S3 upload failed",
                    error: err.message,
                });
            }

        });
    } catch (error) {
        return res.send({ result: false, message: error.message });
    }
};

module.exports.ApproveVerification = async (req, res) => {
    try {
        const { user_id, status } = req.body;

        if (!user_id || !status) {
            return res.send({
                result: false,
                message: "user_id and status are required"
            });
        }

        const result = await model.VerifyUserProfileApprove(user_id, status);

        if (result.affectedRows === 0) {

            return res.send({
                result: false,
                message: "User not found"
            });
        }
        if (status.toLowerCase() == 'approved') {
            await SendNotification({
                sender_id: '',
                receiver_id: user_id,
                message: `Profile verified successfully. A verified badge has been added to your profile`,
                type: "profileVerification",
            });
        }
        if (status.toLowerCase() == 'rejected') {
            await SendNotification({
                sender_id: '',
                receiver_id: user_id,
                message: `Profile verification failed. Please upload a clear selfie.`,
                type: "profileVerification",
            });
        }


        return res.send({
            result: true,
            message: `User profile verification ${status}`
        });

    } catch (error) {
        console.error("profileVerification Error:", error);

        return res.send({
            result: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};


