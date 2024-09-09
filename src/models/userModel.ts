import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Define an interface for the User document
export interface IUser extends mongoose.Document {
  email: string;
  password: string;
  passwordConfirm?: string;
  name: string;
  role: string;
  photo?: string;
  passwordChangedAt?: Date;
  passwordResetToken: String;
  passwordResetExpires: Date;
  correctPassword(
    candidatePassword: string,
    userPassword: string
  ): Promise<boolean>;
  changedPasswordAfter(JWTTimeStamp: any): Promise<boolean>;
  createPasswordResetToken(): Promise<any>;

}

// Define the User schema
const userSchema = new mongoose.Schema<IUser>({
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minLength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      // This only works on CREATE and SAVE, so if the user is updated, it needs to use save() and not findOneAndUpdate() for example
      validator: function (this: IUser, el: string) {
        return el === this.password;
      },
      message: "Passwords do not match!",
    },
  },
  name: { type: String, required: [true, "Please provide your name"] },
  photo: String,
  passwordChangedAt: { type: Date },
  passwordResetToken: String,
  passwordResetExpires: Date,
});

userSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined; // We only need the passwordConfirm for the validation It's a required input, but don't need to be persisted to the database
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword: any,
  userPassword: any
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = async function (JWTTimeStamp: any) {
  if (this.passwordChangedAt) {
    const passwordChangedTimeStamp = Math.round(
      this.passwordChangedAt.getTime() / 1000
    );

    return JWTTimeStamp < passwordChangedTimeStamp; // 500 < 100 return false, which means the token/jwt was generated after the password change
  }

  // false means NOT changed
  return false;
};

// CREATE PASSWORD RESET TOKEN
userSchema.methods.createPasswordResetToken = async function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);

export default User;
