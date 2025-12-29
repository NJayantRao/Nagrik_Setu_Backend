import {generateToken} from "../middlewares/jwt.js";
import {Admin} from "../models/admin.js";
import {Staff} from "../models/staff.js";
import {sendStaffMail} from "../utils/adminMail.js";
import {checkAdmin} from "../utils/checkAdmin.js";

/**
 * @desc    Register a new staff member
 * @route   POST /admin/staff
 * @access  Private (Admin)
 */
export const registerStaff = async (req, res) => {
  try {
    // Authorization check
    if (!(await checkAdmin(req.user))) {
      return res.status(401).send("Unauthorized Only Admin can Access...");
    }

    // Create staff member
    const data = req.body;
    const newStaff = new Staff(data);

    // Save staff to database
    const response = await newStaff.save();

    // Prepare JWT payload for staff
    const payload = {
      id: response.id,
      email: response.email,
    };

    // Generate authentication token
    const token = generateToken(payload);

    const options = {
      httpOnly: true,
      secure: true,
    };

    // Send staff credentials / welcome email
    await sendStaffMail(response.name, response.uniqueId, response.email);

    res
      .status(200)
      .cookie("token", token, options)
      .json({StaffId: response.uniqueId, token});
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
};

/**
 * @desc    Get list of all staff members
 * @route   GET /admin/staff
 * @access  Private (Admin)
 */
export const staffList = async (req, res) => {
  try {
    // Authorization check
    if (!(await checkAdmin(req.user))) {
      return res.status(401).send("Unauthorized Only Admin can Access...");
    }

    // Fetch all staff sorted by latest
    const staff = await Staff.find().sort({createdAt: -1});

    res.status(200).json({
      msg: "Staff List is...",
      staffs: staff,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
};

/**
 * @desc    Update staff details
 * @route   PUT /admin/staff/:staffId
 * @access  Private (Admin)
 */
export const updateStaff = async (req, res) => {
  try {
    // Authorization check
    if (!(await checkAdmin(req.user))) {
      return res.status(401).send("Unauthorized Only Admin can Access...");
    }

    const staffId = req.params.staffId;

    // Check if staff exists
    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(400).send("Staff doesn't exist...");
    }

    // Update staff information
    const updatedInfo = req.body;
    const response = await Staff.findByIdAndUpdate(staffId, updatedInfo, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      msg: "The Staff Info updated...",
      staff: response,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
};

/**
 * @desc    Delete a staff member
 * @route   DELETE /admin/staff/:staffId
 * @access  Private (Admin)
 */
export const deleteStaff = async (req, res) => {
  try {
    // Authorization check
    if (!(await checkAdmin(req.user))) {
      return res.status(401).send("Unauthorized Only Admin can Access...");
    }

    const staffId = req.params.staffId;

    // Check if staff exists
    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(400).send("Staff doesn't exist...");
    }

    // Delete staff
    await Staff.findByIdAndDelete(staffId);

    res.status(200).json({
      msg: "The Staff Deleted...",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
};
