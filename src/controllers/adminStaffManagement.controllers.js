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

export const registerStaff = async (req, res) => {
  try {
    if (!(await checkAdmin(req.user))) {
      console.log("Only Admin can access");
      return res.status(401).send("Unauthorized Only Admin can Access...");
    }
    const data = req.body;
    const newStaff = new Staff(data);
    const response = await newStaff.save();
    // console.log(response);
    const payload = {
      id: response.id,
      email: response.email,
    };
    const token = generateToken(payload);
    const options = {
      httpOnly: true,
      secure: true,
    };

    await sendStaffMail(response.name, response.uniqueId, response.email);
    res
      .status(200)
      .cookie("token", token, options)
      .json({StaffId: response.uniqueId, token: token});
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
};

export const staffList = async (req, res) => {
  try {
    if (!(await checkAdmin(req.user))) {
      console.log("Only Admin can access");
      return res.status(401).send("Unauthorized Only Admin can Access...");
    }
    const staff = await Staff.find().sort({createdAt: -1});

    res.status(200).json({msg: "Staff List is...", staffs: staff});
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
};

export const updateStaff = async (req, res) => {
  try {
    //Admin check
    if (!(await checkAdmin(req.user))) {
      console.log("Only Admin can access");
      return res.status(401).send("Unauthorized Only Admin can Access...");
    }
    const staffId = req.params.staffId;
    const staff = await Staff.findById(staffId);

    //check whether complaint exists or not
    if (!staff) {
      return res.status(400).send("Staff doesn't exist...");
    }

    const updatedInfo = req.body;

    const response = await Staff.findByIdAndUpdate(staffId, updatedInfo, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({msg: "The Staff Info. updated...", staff: response});
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
};

export const deleteStaff = async (req, res) => {
  try {
    //Admin check
    if (!(await checkAdmin(req.user))) {
      console.log("Only Admin can access");
      return res.status(401).send("Unauthorized Only Admin can Access...");
    }
    const staffId = req.params.staffId;
    const staff = await Staff.findById(staffId);

    //check whether complaint exists or not
    if (!staff) {
      return res.status(400).send("Staff doesn't exist...");
    }

    const response = await Staff.findByIdAndDelete(staffId);

    res.status(200).json({msg: "The Staff Deleted..."});
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
};
