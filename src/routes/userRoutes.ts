import express from "express";
import { signup, login, Protect } from "../controllers/authController.js";
import { getAllUsers } from "../controllers/userController.js";

const router = express.Router();

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/get-all-users").get(Protect, getAllUsers);

export default router;
