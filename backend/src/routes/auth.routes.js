import express from "express";
import {
    registerController,
    loginController,
    getMe,
    logoutController,
} from "../controllers/auth.controller.js";
import identifyUser from "../middlewares/auth.middleware.js";

const authRouter = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access public
 */
authRouter.post("/register", registerController);


/**
 * @route POST /api/auth/login
 * @desc Login a user
 * @access public
 */
authRouter.post("/login", loginController);


/**
 * @route POST /api/auth/logout
 * @desc Logout a user
 * @access public
 */
authRouter.post("/logout", logoutController);


/**
 * @route GET /api/auth/me
 * @desc Get logged-in user's information
 * @access private
 */
authRouter.get("/me", identifyUser, getMe);

export default authRouter;
