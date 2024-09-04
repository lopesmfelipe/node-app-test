import { Response, Request, NextFunction } from "express";
import User from "../models/userModel.js";
import catchAsync from "../utils/catchAsync.js";

export const signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const newUser = await User.create(req.body);

    res.status(201).json({
      status: "success",
      user: newUser,
    });
  }
);
