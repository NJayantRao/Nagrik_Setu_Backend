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

export const complaintsList = async (req, res) => {
  try {
    if (!(await checkAdmin(req.user))) {
      console.log("Only Admin can access");
      return res.status(401).send("Unauthorized Only Admin can Access...");
    }
    const complaints = await Complaints.find().sort({createdAt: -1});

    res
      .status(200)
      .json({msg: "All Complaints are...", complaints: complaints});
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
};

export const getComplaintById = async (req, res) => {
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

    res.status(200).json({msg: "The Complaint is...", complaint: complaint});
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
};

export const updateComplaintStatus = async (req, res) => {
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
      // const staffId = complaint.assignedTo;
      // const staff = await Staff.findById(staffId);

      // if (!staff) return res.status(400).send("Staff doesn't exist...");
      // staff.isActive = false;
      // await staff.save();

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
    res.status(200).json({msg: "Complaint status updated...", status: status});
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
};

export const rejectComplaint = async (req, res) => {
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

      if (staff) staff.isActive = false;
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
      .json({msg: "The Complaint Rejected...", status: complaint.status});
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
};

export const assignStaffToComplaint = async (req, res) => {
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

    res.status(200).json({msg: "The Complaint is...", complaint: complaint});
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
};

export const deleteComplaint = async (req, res) => {
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

    res.status(200).json({msg: "The Complaint Deleted..."});
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
};
