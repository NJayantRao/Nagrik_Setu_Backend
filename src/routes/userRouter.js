import express from "express";
import cookieParser from "cookie-parser";

import {User} from "../models/users.js";
import {jwtAuthMiddleware, generateToken} from "../middlewares/jwt.js";
import {sendMail, forgotPasswordMail} from "../utils/userMail.js";
import {Complaints} from "../models/complaint.js";
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

//user Signup
router.post("/signup", userSignup);

//user login route
router.post("/login", userLogin);

//view profile
router.get("/profile", jwtAuthMiddleware, userProfile);

//change password
router.put("/profile/changePassword", jwtAuthMiddleware, changePasswordUser);

//forgot password
router.post("/forgotPassword", userForgotPassword);

// //reset password
router.put("/resetPassword", userResetPassword);

//view all complaints
router.get("/profile/complaints", jwtAuthMiddleware, userComplaintsList);

//get all departments
router.get(
  "/profile/complaints/departments",
  jwtAuthMiddleware,
  getDepartmentsId
);

//delete User
router.delete("/delete", jwtAuthMiddleware, userDelete);

//logout
router.get("/logout", jwtAuthMiddleware, userLogout);

export {userRouter};
