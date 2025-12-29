import {Department} from "../models/departments.js";
import {checkAdmin} from "../utils/checkAdmin.js";

/**
 * @desc    Register a new department
 * @route   POST /admin/department
 * @access  Private (Admin)
 */
export const registerDepartment = async (req, res) => {
  try {
    // Authorization check
    if (!(await checkAdmin(req.user))) {
      return res.status(401).send("Unauthorized Only Admin can Access...");
    }

    // Create department
    const data = req.body;
    const newDepartment = new Department(data);

    // Save department
    const response = await newDepartment.save();

    res.status(200).json({
      msg: "Department Saved...",
      id: response.id,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
};

/**
 * @desc    Get list of all departments
 * @route   GET /admin/departments
 * @access  Private (Admin)
 */
export const departmentsList = async (req, res) => {
  try {
    // Authorization check
    if (!(await checkAdmin(req.user))) {
      return res.status(401).send("Unauthorized Only Admin can Access...");
    }

    // Fetch all departments sorted by latest
    const departmentList = await Department.find().sort({createdAt: -1});

    res.status(200).json({
      msg: "Department List is...",
      departmentList,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
};

/**
 * @desc    Update department details
 * @route   PUT /admin/department/:departmentId
 * @access  Private (Admin)
 */
export const updateDepartment = async (req, res) => {
  try {
    // Authorization check
    if (!(await checkAdmin(req.user))) {
      return res.status(401).send("Unauthorized Only Admin can Access...");
    }

    const departmentId = req.params.departmentId;

    // Check if department exists
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(401).send("Department not Found...");
    }

    // Update department
    const updatedDepartmentInfo = req.body;
    const response = await Department.findByIdAndUpdate(
      departmentId,
      updatedDepartmentInfo,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      msg: "Department Updated...",
      response,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
};

/**
 * @desc    Delete a department
 * @route   DELETE /admin/department/:departmentId
 * @access  Private (Admin)
 */
export const deleteDepartment = async (req, res) => {
  try {
    // Authorization check
    if (!(await checkAdmin(req.user))) {
      return res.status(401).send("Unauthorized Only Admin can Access...");
    }

    const departmentId = req.params.departmentId;

    // Check if department exists
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(401).send("Department not Found...");
    }

    // Delete department
    await Department.findByIdAndDelete(departmentId);

    res.status(200).send("Department Deleted...");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
};
