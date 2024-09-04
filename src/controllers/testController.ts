import { Request, Response, NextFunction, response } from "express";
import catchAsync from "../utils/catchAsync.js";

// GET TEST
export const getTest = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const message = "THIS IS THE MESSAGE";

    res.status(200).json({
      status: "success",
      message,
    });
  }
);
