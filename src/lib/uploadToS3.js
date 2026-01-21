import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";

const region = process.env.AWS_REGION;

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  endpoint: `https://s3.${region}.amazonaws.com`, // ✅ IMPORTANT
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export default async function uploadToS3(file, folder = "uploads") {
  if (!file) {
    throw new Error("No file provided to uploadToS3");
  }

  // ✅ Formidable file can be array or object
  const actualFile = Array.isArray(file) ? file[0] : file;

  if (!actualFile.filepath) {
    throw new Error("Invalid file object: filepath missing");
  }

  const fileStream = fs.createReadStream(actualFile.filepath);
  const fileName = `${folder}/${Date.now()}_${actualFile.originalFilename}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: fileName,
    Body: fileStream,
    ContentType: actualFile.mimetype,
  });

  await s3.send(command);

  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
}
