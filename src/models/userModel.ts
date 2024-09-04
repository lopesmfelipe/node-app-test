import mongoose from "mongoose";
import validator from "validator";

// Define an interface for the User document
interface IUser extends Document {
  email: string;
  password: string;
  passwordConfirm: string;
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

const User = mongoose.model("User", userSchema);

export default User;
