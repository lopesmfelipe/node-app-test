import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync.js";
import User, { IUser } from "../models/userModel.js";
import AppError from "../utils/appError.js";

interface CustomRequest extends Request {
  user?: IUser;
}

const filterObj = (obj: any, allowedFields: string[]) => {
  const newObj: { [key: string]: any } = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// GET ALL USERS
export const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await User.find();

    res.status(200).json({
      status: "success",
      users,
    });
  }
);

// UPDATE USER DATA
export const updateUserData = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError("User not found", 400));

    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
      next(
        new AppError(
          "This route is not for password updates, please use /update-password",
          400
        )
      );
    }

    const filteredBody = filterObj(req.body, ["email", "name", "active"]);

    // 2) Update user document
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user.id }, // Filter to find the user
      filteredBody, // Fields to udpate
      { new: true, runValidators: true } // Options: return updated document, and run schema validators
    );

    res.status(200).json({
      status: "success",
      updatedUser,
    });
  }
);

// DELETE USER
export const deleteMe = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError("User not found", 404));

    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
      status: "success",
      data: null,
    });
  }
);
