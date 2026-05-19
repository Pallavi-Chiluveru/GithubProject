import { v2 as cloudinary } from "cloudinary";

const DEFAULT_CLOUDINARY_FOLDER = "github-style/uploads";

const configureCloudinary = () => {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return false;
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });

  return true;
};

export async function uploadToCloudinary(file) {
  if (!configureCloudinary()) {
    return null;
  }

  const result = await cloudinary.uploader.upload(file.path, {
    folder: process.env.CLOUDINARY_FOLDER || DEFAULT_CLOUDINARY_FOLDER,
    resource_type: "auto",
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    resourceType: result.resource_type,
  };
}

export async function deleteFromCloudinary(file) {
  if (!file.cloudPublicId || !file.cloudResourceType || !configureCloudinary()) {
    return;
  }

  await cloudinary.uploader.destroy(file.cloudPublicId, {
    resource_type: file.cloudResourceType,
  });
}
