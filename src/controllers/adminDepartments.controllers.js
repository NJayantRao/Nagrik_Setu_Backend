import {jwtAuthMiddleware, generateToken} from "../middlewares/jwt.js";
import {User} from "../models/users.js";
import {Admin} from "../models/admin.js";
import {Department} from "../models/departments.js";
import {Complaints} from "../models/complaint.js";
import {Staff} from "../models/staff.js";
import {
  sendMail,
  forgotPasswordMail,
  sendStaffMail,
} from "../utils/adminMail.js";
import {
  complaintMailResolved,
  complaintMailRejected,
} from "../utils/complaintMail.js";

export const registerDepartment = async (req, res) => {
  try {
    if (!(await checkAdmin(req.user))) {
      console.log("Only Admin can access");
      return res.status(401).send("Unauthorized Only Admin can Access...");
    }
    const data = req.body;
    const newDepartment = new Department(data);
    const response = await newDepartment.save();
    console.log(response);

    res.status(200).json({msg: "Department Saved...", id: response.id});
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
};

export const departmentsList = async (req, res) => {
  try {
    if (!(await checkAdmin(req.user))) {
      console.log("Only Admin can access");
      return res.status(401).send("Unauthorized Only Admin can Access...");
    }

    const departmentList = await Department.find().sort({createdAt: -1});
    // console.log(departmentList);

    res
      .status(200)
      .json({msg: "Department List is...", departmentList: departmentList});
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
};

export const updateDepartment = async (req, res) => {
  try {
    if (!(await checkAdmin(req.user))) {
      console.log("Only Admin can access");
      return res.status(401).send("Unauthorized Only Admin can Access...");
    }

    const departmentId = req.params.departmentId;
    // console.log(departmentId);
    const department = await Department.findById(departmentId);

    if (!department) {
      return res.status(401).send("Department not Found...");
    }
    const updatedDepartmentInfo = req.body;
    const response = await Department.findByIdAndUpdate(
      departmentId,
      updatedDepartmentInfo,
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(200).json({msg: "Department Updated...", response: response});
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    if (!(await checkAdmin(req.user))) {
      console.log("Only Admin can access");
      return res.status(401).send("Unauthorized Only Admin can Access...");
    }
    const departmentId = req.params.departmentId;
    // console.log(departmentId);
    const department = await Department.findById(departmentId);

    if (!department) {
      return res.status(401).send("Department not Found...");
    }
    const response = await Department.findByIdAndDelete(departmentId);
    res.status(200).send("Department Deleted...");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
};
