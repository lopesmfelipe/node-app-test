import express from "express";
import { signup, login } from "../controllers/authController.js";
import { getAllUsers } from "../controllers/userController.js";

const router = express.Router();

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/").get(getAllUsers);

export default router;
