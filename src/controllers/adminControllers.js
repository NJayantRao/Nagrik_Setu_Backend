import {generateToken} from "../middlewares/jwt.js";
import {Admin} from "../models/admin.js";
import {sendMail, forgotPasswordMail} from "../utils/adminMail.js";
import {checkAdmin} from "../utils/checkAdmin.js";

/**
 * @desc    Register a new Admin
 * @route   POST /admin/signup
 * @access  Public
 */
export const adminSignUp = async (req, res) => {
  try {
    // Create admin from request body
    const data = req.body;
    const newAdmin = new Admin(data);

    // Save admin to database
    const response = await newAdmin.save();

    // Prepare JWT payload
    const payload = {
      id: response.id,
      email: response.email,
    };

    // Generate authentication token
    const token = generateToken(payload);

    // Secure cookie options
    const options = {
      httpOnly: true,
      secure: true,
    };

    // Send admin welcome / verification email
    await sendMail(response.name, response.uniqueId, response.email);

    res
      .status(200)
      .cookie("token", token, options)
      .json({AdminId: response.uniqueId, token});
  } catch (error) {
    console.log(error);

    // Handle duplicate admin registration
    if (error.code === 11000) {
      return res.status(400).send("Admin Already Exists. Please Login");
    }

    res.status(500).send("Internal Server Error...");
  }
};

/**
 * @desc    Login Admin
 * @route   POST /admin/login
 * @access  Public
 */
export const adminLogin = async (req, res) => {
  try {
    const {uniqueId, password} = req.body;

    // Find admin by unique ID
    const admin = await Admin.findOne({uniqueId});

    // Admin existence check
    if (!admin) {
      return res.status(401).send("Admin doesn't exist");
    }

    // Password validation
    const isPasswordCorrect = await admin.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).send("Incorrect password");
    }

    // JWT payload
    const payload = {
      id: admin.id,
      email: admin.email,
    };

    // Generate token
    const token = generateToken(payload);

    const options = {
      httpOnly: true,
      secure: true,
    };

    res
      .status(200)
      .cookie("token", token, options)
      .json({uniqueId: admin.uniqueId, token});
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
};

/**
 * @desc    Send OTP for admin password reset
 * @route   POST /admin/forgot-password
 * @access  Public
 */
export const adminForgotPassword = async (req, res) => {
  try {
    const {uniqueId} = req.body;

    // Find admin
    const admin = await Admin.findOne({uniqueId});
    if (!admin) return res.status(401).send("Admin not Found...");

    // Generate 6-digit OTP
    const generateRandomCode = () =>
      Math.floor(100000 + Math.random() * 900000);

    const verificationCode = generateRandomCode();

    // Send OTP email
    await forgotPasswordMail(admin.name, verificationCode, admin.email);

    // Save OTP and expiry
    admin.otp = verificationCode.toString();
    admin.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    await admin.save();

    res.status(200).json({
      otp: admin.otp,
      expiry: admin.otpExpiry,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
};

/**
 * @desc    Reset admin password using OTP
 * @route   POST /admin/reset-password
 * @access  Public
 */
export const adminResetPassword = async (req, res) => {
  try {
    const {uniqueId, otp, newPassword} = req.body;

    // Validate required fields
    if (!uniqueId || !otp || !newPassword) {
      return res.status(401).send("Enter all required fields properly...");
    }

    // Find admin
    const admin = await Admin.findOne({uniqueId});
    if (!admin) return res.status(401).send("Admin not Found...");

    // OTP validation
    if (admin.otp !== otp) {
      return res.status(401).send("Invalid OTP...");
    }

    // OTP expiry check
    if (admin.otpExpiry < Date.now()) {
      return res.status(401).send("OTP Expired...");
    }

    // Update password
    admin.password = newPassword;

    // Clear OTP fields
    admin.otp = undefined;
    admin.otpExpiry = undefined;
    await admin.save();

    res.status(200).send("Password Saved Successfully...");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
};

/**
 * @desc    View logged-in Admin profile
 * @route   GET /admin/profile
 * @access  Private (Admin)
 */
export const viewAdminProfile = async (req, res) => {
  try {
    // Authorization check
    if (!(await checkAdmin(req.user))) {
      return res.status(401).send("Unauthorized Only Admin can Access...");
    }

    const adminId = req.user.id;
    const adminData = await Admin.findById(adminId);

    res.status(200).send(adminData);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
};

/**
 * @desc    Change admin password
 * @route   PUT /admin/change-password
 * @access  Private (Admin)
 */
export const changePasswordAdmin = async (req, res) => {
  try {
    // Authorization check
    if (!(await checkAdmin(req.user))) {
      return res.status(401).send("Unauthorized Only Admin can Access...");
    }

    const {currentPassword, newPassword} = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(401).send("Enter Both Passwords...");
    }

    const adminId = req.user.id;
    const admin = await Admin.findById(adminId);

    // Verify current password
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).send("Incorrect Password...");
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    res.status(200).send("Password Saved Successfully...");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
};

/**
 * @desc    Logout admin
 * @route   POST /admin/logout
 * @access  Private (Admin)
 */
export const adminLogout = async (req, res) => {
  try {
    const options = {
      httpOnly: true,
      secure: true,
    };

    // Clear authentication cookie
    res
      .status(200)
      .clearCookie("token", options)
      .send("Logged Out Successfully...");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
};
