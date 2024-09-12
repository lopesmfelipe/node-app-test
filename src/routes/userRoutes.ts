import express from "express";
import {
  signup,
  login,
  protect,
  forgotPassword,
  resetPassword,
  updatePassword,
} from "../controllers/authController.js";
import {
  deleteMe,
  getAllUsers,
  updateUserData,
} from "../controllers/userController.js";

const router = express.Router();

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password/:resetToken").patch(resetPassword);
router.route("/update-password").patch(protect, updatePassword);

router.route("/update-me").patch(protect, updateUserData);
router.route("/delete-me").delete(protect, deleteMe); // This route handler/controller is protected and restricted, by defining the role that are allowed to interact with this resource

router.route("/get-all-users").get(protect, getAllUsers);
// the 'restrictTo()' function will then run and return the middleware function itself

export default router;
