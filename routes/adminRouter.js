import express from "express";
import cookieParser from "cookie-parser";

import { jwtAuthMiddleware, generateToken } from "../jwt.js";
import { User } from "../models/users.js";
import { Admin } from "../models/admin.js";
import { Department } from "../models/departments.js";
import { Complaints } from "../models/complaint.js";
import { Staff } from "../models/staff.js";
import {
  sendMail,
  forgotPasswordMail,
  sendStaffMail,
} from "../utils/adminMail.js";
import {
  complaintMailResolved,
  complaintMailRejected,
} from "../utils/complaintMail.js";
import {
  adminForgotPassword,
  adminLogin,
  adminResetPassword,
  adminSignUp,
} from "../controllers/adminControllers.js";

const router = express.Router();
const adminRouter = router;

async function checkAdmin(admin) {
  try {
    const cand = await Admin.findById(admin.id);
    return cand.role === "Admin";
  } catch (error) {
    return false;
  }
}

//1.admin account management routes
//admin Signup
router.post("/signup", adminSignUp);

//admin login route
router.post("/login", adminLogin);
//admin profile view
router.get("/profile", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdmin(req.user))) {
      console.log("Only Admin can access");
      return res.status(401).send("Unauthorized Only Admin can Access...");
    }
    const adminId = req.user.id;
    // console.log(adminId);
    const adminData = await Admin.findById(adminId);
    console.log(adminData);

    res.status(200).send(adminData);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
});

//admin change password
router.put("/profile/changePassword", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdmin(req.user))) {
      console.log("Only Admin can access");
      return res.status(401).send("Unauthorized Only Admin can Access...");
    }

    const { currentPassword, newPassword } = req.body;

    //Both Password are required
    if (!currentPassword || !newPassword) {
      return res.status(401).send("Enter Both Passwords...");
    }
    const adminId = req.user.id;
    const admin = await Admin.findById(adminId);

    const isMatch = await admin.comparePassword(currentPassword);
    //If password is incorrect
    if (!isMatch) {
      return res.status(401).send("Incorrect Password...");
    }

    admin.password = newPassword;
    await admin.save();

    console.log("Password Saved Successfully...");

    res.status(200).send("Password Saved Successfully...");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
});

//admin forgot password
router.post("/forgotPassword", adminForgotPassword);

//admin reset password
router.put("/resetPassword", adminResetPassword);

//logout
router.get("/logout", jwtAuthMiddleware, async (req, res) => {
  try {
    const adminId = req.user.id;
    const admin = await Admin.findById(adminId);
    // console.log(admin);
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
});

//2. Department management routes
//Department register
router.post("/department/register", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdmin(req.user))) {
      console.log("Only Admin can access");
      return res.status(401).send("Unauthorized Only Admin can Access...");
    }
    const data = req.body;
    const newDepartment = new Department(data);
    const response = await newDepartment.save();
    console.log(response);

    res.status(200).json({ msg: "Department Saved...", id: response.id });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
});

//List of all Department
router.get("/department", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdmin(req.user))) {
      console.log("Only Admin can access");
      return res.status(401).send("Unauthorized Only Admin can Access...");
    }

    const departmentList = await Department.find().sort({ createdAt: -1 });
    // console.log(departmentList);

    res
      .status(200)
      .json({ msg: "Department List is...", departmentList: departmentList });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
});

//update Department
router.put("/department/:departmentId", jwtAuthMiddleware, async (req, res) => {
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
    res.status(200).json({ msg: "Department Updated...", response: response });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
});
//delete Department
router.delete(
  "/department/:departmentId",
  jwtAuthMiddleware,
  async (req, res) => {
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
  }
);

//3.Staff management routes
//create Staff
router.post("/staff/register", jwtAuthMiddleware, async (req, res) => {
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
      .json({ StaffId: response.uniqueId, token: token });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
});

//List of all Staff
router.get("/staff", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdmin(req.user))) {
      console.log("Only Admin can access");
      return res.status(401).send("Unauthorized Only Admin can Access...");
    }
    const staff = await Staff.find().sort({ createdAt: -1 });

    res.status(200).json({ msg: "Staff List is...", staffs: staff });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
});

//update Staff info
router.put("/staff/:staffId", jwtAuthMiddleware, async (req, res) => {
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

    res
      .status(200)
      .json({ msg: "The Staff Info. updated...", staff: response });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
});

//delete Staff
router.delete("/staff/:staffId", jwtAuthMiddleware, async (req, res) => {
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

    res.status(200).json({ msg: "The Staff Deleted..." });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
});

//4.complaints management routes
//List of all complaints
router.get("/complaints", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdmin(req.user))) {
      console.log("Only Admin can access");
      return res.status(401).send("Unauthorized Only Admin can Access...");
    }
    const complaints = await Complaints.find().sort({ createdAt: -1 });

    res
      .status(200)
      .json({ msg: "All Complaints are...", complaints: complaints });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
});

// get complaints by id
router.get("/complaints/:complaintId", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdmin(req.user))) {
      console.log("Only Admin can access");
      return res.status(401).send("Unauthorized Only Admin can Access...");
    }
    const complaintId = req.params.complaintId;
    const complaint = await Complaints.findById(complaintId);

    if (!complaint) {
      return res.status(401).send("Complaints doesn't exist...");
    }

    res.status(200).json({ msg: "The Complaint is...", complaint: complaint });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
});
//update complaints status
router.put(
  "/complaints/:complaintId/status/next",
  jwtAuthMiddleware,
  async (req, res) => {
    try {
      //Admin check
      if (!(await checkAdmin(req.user))) {
        console.log("Only Admin can access");
        return res.status(401).send("Unauthorized Only Admin can Access...");
      }
      const complaintId = req.params.complaintId;
      const complaint = await Complaints.findById(complaintId);

      //check whether complaint exists or not
      if (!complaint) {
        return res.status(400).send("Complaints doesn't exist...");
      }

      //finding current index
      const allowedStatuses = [
        "Filed",
        "Acknowledged",
        "In-Progress",
        "Resolved",
      ];
      const currentIndex = allowedStatuses.indexOf(complaint.status);

      //if Invalid status
      if (currentIndex === -1) {
        return res.status(400).send("Invalid Status...");
      }

      //if already resolved
      if (currentIndex === allowedStatuses.length - 1) {
        return res.status(400).send("Complaint already resolved...");
      }

      const next = currentIndex + 1;
      const status = allowedStatuses[next];
      complaint.status = status;
      await complaint.save();

      //if resolved then make staff available
      if (allowedStatuses[next] === "Resolved") {
        const staffId = complaint.assignedTo;
        const staff = await Staff.findById(staffId);

        if (!staff) return res.status(400).send("Staff doesn't exist...");
        staff.isActive = false;
        await staff.save();

        //Sending mail on resolved
        const userId = complaint.user;
        const user = await User.findById(userId);
        if (!user) return res.status(400).send("User doesn't exist...");
        await complaintMailResolved(
          user.name,
          complaint.uniqueToken,
          complaint.title,
          user.email
        );
      }
      res
        .status(200)
        .json({ msg: "The Complaint status updated...", status: status });
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error...");
    }
  }
);

//update complaint status for rejection
router.put(
  "/complaints/:complaintId/status/reject",
  jwtAuthMiddleware,
  async (req, res) => {
    try {
      //Admin check
      if (!(await checkAdmin(req.user))) {
        console.log("Only Admin can access");
        return res.status(401).send("Unauthorized Only Admin can Access...");
      }
      const complaintId = req.params.complaintId;
      const complaint = await Complaints.findById(complaintId);

      //check whether complaint exists or not
      if (!complaint) {
        return res.status(400).send("Complaints doesn't exist...");
      }

      //if already resolved
      if (complaint.status === "Resolved") {
        return res
          .status(400)
          .send("Can't Reject, Complaint already resolved...");
      }

      if (complaint.status === "Rejected") {
        return res.status(400).send("Complaint already Rejected...");
      }

      complaint.status = "Rejected";
      await complaint.save();

      //if rejected then make staff available
      if (complaint.assignedTo) {
        const staffId = complaint.assignedTo;
        const staff = await Staff.findById(staffId);

        if (!staff) return res.status(400).send("Staff doesn't exist...");
        staff.isActive = false;
        await staff.save();

        //Sending mail on resolved
        const userId = complaint.user;
        const user = await User.findById(userId);
        if (!user) return res.status(400).send("User doesn't exist...");
        await complaintMailRejected(
          user.name,
          complaint.uniqueToken,
          complaint.title,
          user.email
        );
      }

      res
        .status(200)
        .json({ msg: "The Complaint Rejected...", status: complaint.status });
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error...");
    }
  }
);

//update complaints assign staff
router.put(
  "/complaints/:complaintId/assignedTo/:staffId",
  jwtAuthMiddleware,
  async (req, res) => {
    try {
      //Admin check
      if (!(await checkAdmin(req.user))) {
        console.log("Only Admin can access");
        return res.status(401).send("Unauthorized Only Admin can Access...");
      }
      const complaintId = req.params.complaintId;
      const complaint = await Complaints.findById(complaintId);
      //check whether complaint exists or not
      if (!complaint) {
        return res.status(400).send("Complaints doesn't exist...");
      }

      const staffId = req.params.staffId;
      const staff = await Staff.findById(staffId);
      //check whether staff exists or not
      if (!staff) {
        return res.status(400).send("Staff doesn't exist...");
      }

      //if staff already assigned
      if (staff.isActive)
        return res.status(400).send("Staff already assigned...");

      complaint.assignedTo = staffId;
      await complaint.save();

      staff.isActive = true;
      await staff.save();

      res
        .status(200)
        .json({ msg: "The Complaint is...", complaint: complaint });
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error...");
    }
  }
);

//delete complaints
router.delete(
  "/complaints/:complaintId",
  jwtAuthMiddleware,
  async (req, res) => {
    try {
      //Admin check
      if (!(await checkAdmin(req.user))) {
        console.log("Only Admin can access");
        return res.status(401).send("Unauthorized Only Admin can Access...");
      }
      const complaintId = req.params.complaintId;
      const complaint = await Complaints.findById(complaintId);

      //check whether complaint exists or not
      if (!complaint) {
        return res.status(400).send("Complaints doesn't exist...");
      }

      const response = await Complaints.findByIdAndDelete(complaintId);

      res.status(200).json({ msg: "The Complaint Deleted..." });
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error...");
    }
  }
);

export { adminRouter };
