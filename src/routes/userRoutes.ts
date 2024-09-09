import express from "express";
import { signup, login, protect, restrictTo } from "../controllers/authController.js";
import { deleteUser, getAllUsers } from "../controllers/userController.js";

const router = express.Router();

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/get-all-users").get(protect, getAllUsers);
router.route("delete-user").delete(protect, restrictTo('admin'),deleteUser)

export default router;
