import express from "express";
import cookieParser from "cookie-parser";
import {jwtAuthMiddleware} from "../middlewares/jwt.js";

import {
  userComplaintsList,
  userForgotPassword,
  userLogin,
  userResetPassword,
  userSignup,
  userLogout,
  getDepartmentsId,
  userDelete,
  userProfile,
  changePasswordUser,
} from "../controllers/userControllers.js";

const router = express.Router();
const userRouter = router;

/**
 * ===========================
 * USER AUTH & PROFILE ROUTES
 * ===========================
 */

/**
 * @route   POST /user/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post("/signup", userSignup);

/**
 * @route   POST /user/login
 * @desc    Login user and generate JWT
 * @access  Public
 */
router.post("/login", userLogin);

/**
 * @route   GET /user/profile
 * @desc    Get logged-in user profile
 * @access  Private
 */
router.get("/profile", jwtAuthMiddleware, userProfile);

/**
 * @route   PUT /user/profile/changePassword
 * @desc    Change logged-in user password
 * @access  Private
 */
router.put("/profile/changePassword", jwtAuthMiddleware, changePasswordUser);

/**
 * @route   POST /user/forgotPassword
 * @desc    Send OTP for password reset
 * @access  Public
 */
router.post("/forgotPassword", userForgotPassword);

/**
 * @route   PUT /user/resetPassword
 * @desc    Reset password using OTP
 * @access  Public
 */
router.put("/resetPassword", userResetPassword);

/**
 * @route   GET /user/profile/complaints
 * @desc    Get all complaints of logged-in user
 * @access  Private
 */
router.get("/profile/complaints", jwtAuthMiddleware, userComplaintsList);

/**
 * @route   GET /user/profile/complaints/departments
 * @desc    Get list of departments for complaint registration
 * @access  Private
 */
router.get(
  "/profile/complaints/departments",
  jwtAuthMiddleware,
  getDepartmentsId
);

/**
 * @route   DELETE /user/delete
 * @desc    Delete logged-in user account
 * @access  Private
 */
router.delete("/delete", jwtAuthMiddleware, userDelete);

/**
 * @route   GET /user/logout
 * @desc    Logout user and clear JWT cookie
 * @access  Private
 */
router.get("/logout", jwtAuthMiddleware, userLogout);

export {userRouter};
