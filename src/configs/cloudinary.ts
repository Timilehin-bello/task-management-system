import { v2 as cloudinary } from "cloudinary";
import { config } from "./config";

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,

  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export const uploads = async (file: any) => {
  const { public_id: publicId, url } = await cloudinary.uploader.upload(file, {
    upload_preset: "swyke",
    resource_type: "auto",
    use_filename: true,
  });
  return {
    url,
    publicId,
  };
};

export const deleteFile = async (publicId: any) => {
  return cloudinary.uploader.destroy(publicId);
};
