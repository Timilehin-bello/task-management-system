import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";
import { uploadService } from "../services";
import { Request, Response } from "express";

const upLoadFile = catchAsync(
  async (req: Request, res: Response): Promise<any> => {
    const url = await uploadService.uploadFile(req.file);
    return res.status(httpStatus.CREATED).send({ url });
  }
);

export { upLoadFile };
