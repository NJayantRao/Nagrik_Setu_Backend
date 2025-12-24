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
} from "../controllers/userControllers.js";

const router = express.Router();
const userRouter = router;

//user Signup
router.post("/signup", userSignup);

//user login route
router.post("/login", userLogin);

//view profile
router.get("/profile", jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    // console.log(userId);
    const userData = await User.findById(userId);
    if (!userData) return res.status(401).send("User not found...");
    //  console.log(userData);
    res.status(200).send(userData);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
});

//change password
router.put("/profile/changePassword", jwtAuthMiddleware, async (req, res) => {
  try {
    const {currentPassword, newPassword} = req.body;

    //Both Password are required
    if (!currentPassword || !newPassword) {
      return res.status(401).send("Enter Both Passwords...");
    }
    const userId = req.user.id;
    const user = await User.findById(userId);

    const isMatch = await user.comparePassword(currentPassword);
    //If password is incorrect
    if (!isMatch) {
      return res.status(401).send("Incorrect Password...");
    }

    user.password = newPassword;
    await user.save();

    console.log("Password Saved Successfully...");

    res.status(200).send("Password Saved Successfully...");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
});

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
