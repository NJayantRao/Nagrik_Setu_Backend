import {User} from "../models/users.js";
import {generateToken} from "../middlewares/jwt.js";
import {sendMail, forgotPasswordMail} from "../utils/userMail.js";
import {Complaints} from "../models/complaint.js";
import {Department} from "../models/departments.js";

/**
 * @desc    Register a new user
 * @route   POST /user/signup
 * @access  Public
 */
export const userSignup = async (req, res) => {
  try {
    // Create new user from request body
    const data = req.body;
    const newUser = new User(data);

    // Save user to database
    const response = await newUser.save();
    // console.log("User Saved Successfully...");

    // Prepare payload for JWT
    const payload = {
      id: response.id,
      email: response.email,
    };

    // Generate JWT token
    const token = generateToken(payload);

    // Cookie options for security
    const options = {
      httpOnly: true,
      secure: true,
    };

    // Send welcome / verification mail
    await sendMail(response.name, response.uniqueToken, response.email);

    // Send token and uniqueToken to client
    res
      .status(200)
      .cookie("token", token, options)
      .json({uniqueToken: response.uniqueToken, token});
  } catch (error) {
    // Handle duplicate user error
    if (error.code === 11000) {
      // console.log("User already exists");
      return res.status(400).send("User Already Exists. Please Login");
    }

    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
};

/**
 * @desc    Login user
 * @route   POST /user/login
 * @access  Public
 */
export const userLogin = async (req, res) => {
  try {
    const {uniqueToken, password} = req.body;

    // Find user using unique token
    const user = await User.findOne({uniqueToken});

    // If user not found
    if (!user) {
      return res.status(401).send("User doesn't exist");
    }

    // Validate password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).send("Incorrect password");
    }

    // JWT payload
    const payload = {
      id: user.id,
      email: user.email,
    };

    // Generate token
    const token = generateToken(payload);

    const options = {
      httpOnly: true,
      secure: true,
    };

    // Send token in cookie
    res
      .status(200)
      .cookie("token", token, options)
      .json({uniqueToken: user.uniqueToken, token});
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
};

/**
 * @desc    Send OTP for password reset
 * @route   POST /user/forgot-password
 * @access  Public
 */
export const userForgotPassword = async (req, res) => {
  try {
    const {uniqueToken} = req.body;

    // Find user by unique token
    const user = await User.findOne({uniqueToken});
    if (!user) return res.status(401).send("User not Found...");

    // Generate 6-digit OTP
    const generateRandomCode = () =>
      Math.floor(100000 + Math.random() * 900000);

    const verificationCode = generateRandomCode();

    // Send OTP mail
    await forgotPasswordMail(user.name, verificationCode, user.email);

    // Save OTP and expiry
    user.otp = verificationCode.toString();
    user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    res.status(200).json({
      otp: user.otp,
      expiry: user.otpExpiry,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
};

/**
 * @desc    Reset user password using OTP
 * @route   POST /user/reset-password
 * @access  Public
 */
export const userResetPassword = async (req, res) => {
  try {
    const {uniqueToken, otp, newPassword} = req.body;

    // Validate required fields
    if (!uniqueToken || !otp || !newPassword) {
      return res.status(401).send("Enter all required fields properly...");
    }

    // Find user
    const user = await User.findOne({uniqueToken});
    if (!user) return res.status(401).send("User not Found...");

    // Validate OTP
    if (user.otp !== otp) {
      return res.status(401).send("Invalid OTP...");
    }

    // Check OTP expiry
    if (user.otpExpiry < Date.now()) {
      return res.status(401).send("OTP Expired...");
    }

    // Update password
    user.password = newPassword;

    // Clear OTP fields
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).send("Password Saved Successfully...");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
};

/**
 * @desc    Get all complaints of logged-in user
 * @route   GET /user/complaints
 * @access  Private
 */
export const userComplaintsList = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch complaints filed by user
    const complaints = await Complaints.find({user: userId});

    res.status(200).send(complaints);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
};

/**
 * @desc    Get all department IDs
 * @route   GET /departments
 * @access  Private
 */
export const getDepartmentsId = async (req, res) => {
  try {
    const userId = req.user.id;

    // Verify user existence
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).send("User doesn't exist...");
    }

    // Fetch all departments
    const departmentList = await Department.find().sort({createdAt: 1});

    res.status(200).json({departments: departmentList});
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

/**
 * @desc    Get logged-in user profile
 * @route   GET /user/profile
 * @access  Private
 */
export const userProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user data
    const userData = await User.findById(userId);
    if (!userData) return res.status(401).send("User not found...");

    res.status(200).send(userData);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
};

/**
 * @desc    Change user password
 * @route   PUT /user/change-password
 * @access  Private
 */
export const changePasswordUser = async (req, res) => {
  try {
    const {currentPassword, newPassword} = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(401).send("Enter Both Passwords...");
    }

    const userId = req.user.id;
    const user = await User.findById(userId);

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).send("Incorrect Password...");
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).send("Password Saved Successfully...");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
};

/**
 * @desc    Logout user
 * @route   POST /user/logout
 * @access  Private
 */
export const userLogout = async (req, res) => {
  try {
    const options = {
      httpOnly: true,
      secure: true,
    };

    // Clear JWT cookie
    res
      .status(200)
      .clearCookie("token", options)
      .send("Logged Out Successfully...");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
};

/**
 * @desc    Delete user account
 * @route   DELETE /user/delete
 * @access  Private
 */
export const userDelete = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).send("User doesn't exist...");
    }

    // Delete user account
    await User.findByIdAndDelete(userId);

    res.status(200).send("Account Deleted...");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
};
