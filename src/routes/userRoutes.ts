import express from "express";
import {
  signup,
  login,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { deleteUser, getAllUsers } from "../controllers/userController.js";

const router = express.Router();

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);

router.route("/get-all-users").get(protect, getAllUsers);
// the 'restrictTo()' function will then run and return the middleware function itself
router.route("/delete-user").delete(protect, restrictTo("admin"), deleteUser); // This route handler/controller is protected and restricted, by defining the role that are allowed to interact with this resource

export default router;
