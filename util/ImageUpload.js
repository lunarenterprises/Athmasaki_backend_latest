// utils/s3.js
const AWS = require("aws-sdk");

// ✅ Configure AWS SDK once globally
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

// ✅ Create and export the S3 instance once
const s3 = new AWS.S3();

// ✅ Upload file to S3
const uploadToS3 = async (fileBuffer, key, contentType) => {

    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
    };

    return await s3.upload(params).promise();
};

// ✅ Delete file from S3
const deleteFromS3 = async (key) => {
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
    };

    return await s3.deleteObject(params).promise();
};

module.exports = {
    uploadToS3,
    deleteFromS3,
};
