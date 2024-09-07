import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync.js";
import User from "../models/userModel.js";

export const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await User.find();

    res.status(200).json({
      status: "success",
      users,
    });
  }
);
