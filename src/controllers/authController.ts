import { Response, Request, NextFunction } from "express";
import { IUser } from "../models/userModel.js";
import User from "../models/userModel.js";
import catchAsync from "../utils/catchAsync.js";
import jwt, { JwtPayload } from "jsonwebtoken";
import AppError from "../utils/appError.js";
import dotenv from "dotenv";
import sendEmail from "../utils/email.js";
import crypto from "crypto";

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

interface CustomRequest extends Request {
  user?: IUser;
}

const createSendToken = (user: any, statusCode: any, res: Response) => {
  const token = signToken(user._id);

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
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
      passwordChangedAt: req.body.passwordChangedAt,
      role: req.body.role,
    });

    createSendToken(newUser, 201, res);
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
    createSendToken(user, 200, res);
  }
);

// PROTECT
export const protect = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
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
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError(
          "The user belonging to this token does no longer exists",
          401
        )
      );
    }

    // 4) Check if user changed password after the token was issued
    if (await currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError("User recently changed password! Please log in again", 401)
      );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser; // Pass the user data in the Request object
    next();
  }
);

// RESTRICT
// '...roles' create an array ['admin', 'moderator'] of all the arguments that were specified
export const restrictTo = (...roles: any) => {
  // This is the middleware function itself that the wrapper function 'restrictTo' returns, which then has access to '...roles'
  return async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError("No user found in Request", 400));

    // Check if user's role included in the allowed roles
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }

    next();
  };
};

export const forgotPassword = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    // 1) Get user based on POSTED email
    const user = (await User.findOne({ email: req.body.email })) as IUser;
    if (!user)
      return next(new AppError("No user found with this email address", 404));

    // 2) Generate random reset token
    const resetToken = await user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Send token to user's email
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/user/reset-password/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and
    passwordConfirm to: ${resetURL}.\n If you didn't forget your password, please ignore this email.`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Your password reset token (valid for 10 min)",
        message,
      });

      res.status(200).json({
        status: "success",
        message: "Token sent to email!",
      });
    } catch (error) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(
        new AppError(
          "There was an error sending the email. Try again later",
          500
        )
      );
    }
  }
);

// RESET PASSWORD
export const resetPassword = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    // 1) Get user based on the token
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.resetToken)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken, // find the user for the token
      passwordResetExpires: { $gt: Date.now() }, // check if token is expired
    });

    // 2) If token has not expired, and there is user, set new password
    if (!user) {
      return next(new AppError("Token is invalid or has expired", 400));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3) Update changedPasswordAt property for the user (done in the model)

    // 4) Log the user in, send JWT
    createSendToken(user, 200, res);
  }
);

// UPDATE PASSWORD (only for logged-in users)
export const updatePassword = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    // 1) Check if user exists in the request object
    if (!req.user) {
      return next(new AppError("User not found", 404));
    }
    
    // 2) Get user from the database
    const { currentPassword, newPassword, newPasswordConfirm } = req.body;
    const user = await User.findById(req.user.id).select("+password");

    // Check if the user exists after fetching
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // 3) Check if posted current password is correct
    if (!(await user.correctPassword(currentPassword, user.password))) {
      return next(
        new AppError("No user found with this email or password", 401)
      );
    }

    // 4) update password
    user.password = newPassword;
    user.passwordConfirm = newPasswordConfirm;
    await user.save();

    // 5) Log user in, send JWT/token
    createSendToken(user, 200, res);
  }
);
