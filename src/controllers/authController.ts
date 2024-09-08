import { Response, Request, NextFunction } from "express";
import User from "../models/userModel.js";
import catchAsync from "../utils/catchAsync.js";
import jwt, { JwtPayload } from "jsonwebtoken";
import AppError from "../utils/appError.js";
import dotenv from "dotenv";
dotenv.config();

const jwtSecret = process.env.JWT_SECRET;
const jwtExpiresIn = process.env.JWT_EXPIRES_IN;

if (!jwtSecret || !jwtExpiresIn) {
  console.log("hello");

  throw new Error("🔶 No environment variables");
}

const signToken = (id: any): string => {
  return jwt.sign({ id }, jwtSecret, {
    expiresIn: jwtExpiresIn,
  });
};

// SIGNUP
export const signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });

    const token = signToken(newUser._id);

    res.status(201).json({
      token,
      status: "success",
      user: newUser,
    });
  }
);

// LOGIN
export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    // 1) CHECK IF EMAIL AND PASSWORD EXIST
    if (!email || !password) {
      return next(new AppError("Please provide email and password", 400));
    }

    // 2) Check if user exists && password is correct
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError("Incorrect email or password", 401));
    }

    // 3) If everything ok, send token to client
    const token = signToken(user._id);

    res.status(200).json({
      status: "success",
      token,
    });
  }
);

// PROTECTING ROUTES
export const Protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Getting token and check if it's there
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    console.log(token);

    if (!token) {
      return next(
        new AppError("You are not logged in! Please log in to get access.", 401)
      );
    }

    // 2) Token verification
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    // 3) Check if user still exists
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) {
      return next(
        new AppError(
          "The user belonging to this token does no longer exists",
          401
        )
      );
    }

    // 4) Check if user changed password after the token was issued

    next();
  }
);
