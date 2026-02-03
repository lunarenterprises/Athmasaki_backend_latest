var model = require('../../model/admin/termsAndPolicty')
var formidable = require("formidable");
var fs = require("fs");
var path = require("path");

module.exports.AddTermsAndPolicy = async (req, res) => {
    try {
        var form = new formidable.IncomingForm({ multiplies: true })
        form.parse(req, async function (err, fields, files) {
            if (err) {
                return res.send({
                    result: false,
                    message: "file upload failed!",
                    data: err,

                });
            }
            console.log("files");
            console.log(files.terms.filepath);
            console.log(files.policy.filepath);


            if (files.terms) {
                const oldPath = files.terms.filepath;
                const fileName = files.terms.originalFilename;
                const saveDir = path.join(process.cwd(), "uploads", "termsandpolicy");
                if (!fs.existsSync(saveDir)) {
                    fs.mkdirSync(saveDir, { recursive: true });
                }
                const newPath = path.join(saveDir, fileName);

                try {
                    const rawData = fs.readFileSync(oldPath);
                    fs.writeFileSync(newPath, rawData);

                    const imagePath = "uploads/termsandpolicy/" + fileName;
                    const existing = await model.ListTermsAndPolicy(); // implement this in your model
                    let result;
                    if (existing.length > 0) {
                        result = await model.UpdateTermsAndCondition(imagePath);
                    } else {
                        result = await model.AddTermsAndCondition(imagePath);
                    }

                } catch (error) {
                    console.log(error);
                    return res.send({
                        result: false,
                        message: "Failed to save file.",
                        data: error
                    });
                }
            }

            if (files.policy) {
                const oldPath = files.policy.filepath;
                const fileName = files.policy.originalFilename;
                const saveDir = path.join(process.cwd(), "uploads", "termsandpolicy");
                if (!fs.existsSync(saveDir)) {
                    fs.mkdirSync(saveDir, { recursive: true });
                }
                const newPath = path.join(saveDir, fileName);

                try {

                    const rawData = fs.readFileSync(oldPath);
                    fs.writeFileSync(newPath, rawData);

                    const imagePath = "uploads/termsandpolicy/" + fileName;
                    const existing = await model.ListTermsAndPolicy(); // implement this in your model
                    let result;
                    if (existing.length > 0) {
                        result = await model.UpdatePrivacyAndPolicy(imagePath);
                    } else {
                        result = await model.AddPrivacyAndPolicy(imagePath);
                    }

                } catch (error) {
                    console.log(error);
                    return res.send({
                        result: false,
                        message: "Failed to save file.",
                        data: error
                    });
                }
            }
            return res.send({
                result: true,
                message: "Terms and condition/privacy policy file updated"
            })

        });

    } catch (error) {
        console.log(error);
        return res.send({
            result: false,
            message: error.message
        });
    }
};



module.exports.ListTermsAndPolicy = async (req, res) => {
    try {

        const TermsAndPolicy = await model.ListTermsAndPolicy();

        return res.send({
            result: true,
            message: "Data retrieved successfully",
            data: TermsAndPolicy
        });

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        });
    }
};



