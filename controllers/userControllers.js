import { User } from "../models/users.js";
import { generateToken, jwtAuthMiddleware } from "../jwt.js";
import { sendMail, forgotPasswordMail } from "../utils/userMail.js";
import { Complaints } from "../models/complaint.js";
import { Department } from "../models/departments.js";
import { log } from "console";

export const userSignup = async (req, res) => {
  try {
    const data = await req.body;
    const newUser = new User(data);
    const response = await newUser.save();
    console.log("User Saved Successfully...");

    const payload = {
      id: response.id,
      email: response.email,
    };
    // console.log(JSON.stringify(payload));
    const token = generateToken(payload);
    // console.log(token);

    const options = {
      httpOnly: true,
      secure: true,
    };

    await sendMail(response.name, response.uniqueToken, response.email);

    res
      .status(200)
      .cookie("token", token, options)
      .json({ uniqueToken: response.uniqueToken, token: token });
  } catch (error) {
    if (error.code === 11000) {
      console.log("User already exists");
      return res.status(400).send("User Already Exists. Please Login");
    }
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
};

export const userLogin = async (req, res) => {
  try {
    const { uniqueToken, password } = req.body;

    //find user
    const user = await User.findOne({ uniqueToken: uniqueToken });

    //if user doesn't exist
    if (!user) {
      return res.status(401).send("User doesn't exist");
    }

    //if password is incorrect
    if (!(await user.comparePassword(password))) {
      return res.status(402).send("Incorrect password");
    }
    const payload = {
      id: user.id,
      email: user.email,
    };

    //jwt token generate
    const token = generateToken(payload);
    // console.log(token);

    const options = {
      httpOnly: true,
      secure: true,
    };
    res
      .status(200)
      .cookie("token", token, options)
      .json({ uniqueToken: user.uniqueToken, token: token });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
};

export const userForgotPassword = async (req, res) => {
  try {
    const { uniqueToken } = req.body;

    const user = await User.findOne({ uniqueToken: uniqueToken });

    if (!user) return res.status(401).send("User not Found...");

    //function to generate verification code
    const generateRandomCode = () => {
      return Math.floor(100000 + Math.random() * 900000);
    };
    const verificationCode = generateRandomCode();
    // console.log(verificationCode);

    await forgotPasswordMail(user.name, verificationCode, user.email);

    user.otp = verificationCode.toString();
    user.otpExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    // console.log(user);
    res.status(200).json({ otp: user.otp, expiry: user.otpExpiry });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
};

export const userResetPassword = async (req, res) => {
  try {
    const { uniqueToken, otp, newPassword } = req.body;

    const user = await User.findOne({ uniqueToken: uniqueToken });

    if (!user) return res.status(401).send("User not Found...");

    if (!uniqueToken || !otp || !newPassword)
      return res.status(401).send("Enter all required fields properly...");

    if (user.otp != otp) return res.status(401).send("Invalid OTP...");

    if (user.otpExpiry < Date.now())
      return res.status(401).send("OTP Expired...");

    user.password = newPassword;

    //clear otp
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // console.log(user);
    res.status(200).send("Password Saved Successfully...");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
};

export const userComplaintsList = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    // console.log(user);
    const complaints = await Complaints.find({ user: userId });

    res.status(200).send(complaints);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
};

export const userLogout = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    // console.log(user);
    const options = {
      httpOnly: true,
      secure: true,
    };

    res
      .status(200)
      .clearCookie("token", options)
      .send("Logged Out Successfully...");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
};

export const getDepartmentsId = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    //if user doesn't exist
    if (!user) {
      return res.status(401).send("User doesn't exist...");
    }

    //all department list
    const departmentList = await Department.find().sort({ createdAt: 1 });

    console.log(departmentList);
    res.status(200).json({ departments: departmentList });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};
