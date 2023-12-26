import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // upload file path on cloudinary.
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file has been uploaded successfuly.
    // console.log("file has been uploaded successfuly", response.url);
    fs.unlinkSync(localFilePath); // remove the loally saved temp file as the upload opration failed.
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the loally saved temp file as the upload opration failed.
    return null;
  }
};

export { uploadOnCloudinary };
