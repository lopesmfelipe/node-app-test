import { Response, Request, NextFunction } from "express";
import User from "../models/userModel.js";
import catchAsync from "../utils/catchAsync.js";
import jwt = require("jsonwebtoken");

export const signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    const token = jwt.sign({ id: newUser._id }, jwtSecret, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(201).json({
      token,
      status: "success",
      user: newUser,
    });
  }
);

export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    // 1) CHECK IF EMAIL AND PASSWORD EXIST


    // 2) Check if user exists && password is correct


    // 3) If everything ok, send token to client

    const token = '';
    res.status(200).json({
      status: 'success',
      token
    });
  }
);
