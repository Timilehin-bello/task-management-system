import multer, { FileFilterCallback } from "multer";
import path from "path";
import { Request } from "express";

const storage = multer.diskStorage({
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    cb(null, `${file.fieldname}-${Date.now()}`);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback | any
) => {
  const filetypes = /jpe?g|png|webp/;
  const mimetype = /image\/jpe?g|image\/png|image\/webp/;

  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const isMimetypeValid = mimetype.test(file.mimetype);

  if (extname && isMimetypeValid) {
    cb(null, true); // Allow the file
  } else {
    cb(new Error("File type not allowed"), false); // Reject the file
  }
};

const uploadUsingMulter = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export default uploadUsingMulter;
