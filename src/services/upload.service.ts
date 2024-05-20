// import { unlinkSync } from "fs";
import logger from "../configs/logger";
import { uploads, deleteFile } from "../configs/cloudinary";
import { prisma } from ".";
import { Prisma } from "@prisma/client";

/**
 * Upload files
 * @param {Object} file
 * @returns {Promise<Object>}
 */
const uploadFile = async (file: any): Promise<object | null> => {
  if (!file) return null;
  logger.info("uploading file");

  // get file type
  const fileType = file.mimetype;
  logger.info("got file type");

  // upload file to cloudinary
  const { url, publicId } = await uploads(file.path);
  logger.info("uploaded file");

  // save file to database

  await prisma.media.create({
    data: {
      url,
      publicId,
      type: fileType,
    },
  });

  logger.info("returned file");
  return { url, publicId };
};

/**
 * Get file
 * @param {string} url
 * @returns {Promise<Object>}
 */
const getFile = async (
  url: string
): Promise<Prisma.MediaWhereUniqueInput | null> => {
  const file = await prisma.media.findFirst({ where: { url } });
  return file;
};

/**
 * Delete file
 * @param {string} url
 * @returns {Promise<Object>}
 */
const deleteUploadedFile = async (
  url: string
): Promise<Prisma.MediaWhereUniqueInput | undefined> => {
  const file = await getFile(url);

  if (!file) return;

  await deleteFile(file.publicId);
  logger.info("deleted file from cloudinary");

  await prisma.media.delete({
    where: { id: file.id },
  });
  logger.info("deleted file from database");
  return file;
};
export { uploadFile, deleteUploadedFile };
