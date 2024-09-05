import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";

// Define an interface for the User document
interface IUser extends Document {
  email: string;
  password: string;
  passwordConfirm?: string;
  name: string;
  role: string;
  photo?: string;
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
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minLength: 8,
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
  role: { type: String, default: "user" },
  photo: String,
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

const User = mongoose.model("User", userSchema);

export default User;
