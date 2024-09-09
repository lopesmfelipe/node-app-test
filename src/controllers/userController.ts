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

export const deleteUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res.status(250).json({
      status: "success",
      message: "User artificially deleted",
    });
  }
);
