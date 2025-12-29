import {User} from "../models/users.js";
import {Complaints} from "../models/complaint.js";
import {Staff} from "../models/staff.js";
import {
  complaintMailResolved,
  complaintMailRejected,
} from "../utils/complaintMail.js";
import {checkAdmin} from "../utils/checkAdmin.js";

/**
 * @desc    Get list of all complaints (Admin only)
 * @route   GET /admin/complaints
 * @access  Private (Admin)
 */
export const complaintsList = async (req, res) => {
  try {
    // Authorization check
    if (!(await checkAdmin(req.user))) {
      return res.status(401).send("Unauthorized Only Admin can Access...");
    }

    // Fetch all complaints sorted by latest first
    const complaints = await Complaints.find().sort({createdAt: -1});

    res.status(200).json({
      msg: "All Complaints are...",
      complaints,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
};

/**
 * @desc    Get a single complaint by ID
 * @route   GET /admin/complaint/:complaintId
 * @access  Private (Admin)
 */
export const getComplaintById = async (req, res) => {
  try {
    // Authorization check
    if (!(await checkAdmin(req.user))) {
      return res.status(401).send("Unauthorized Only Admin can Access...");
    }

    const complaintId = req.params.complaintId;
    const complaint = await Complaints.findById(complaintId);

    // Complaint existence check
    if (!complaint) {
      return res.status(401).send("Complaints doesn't exist...");
    }

    res.status(200).json({
      msg: "The Complaint is...",
      complaint,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
};

/**
 * @desc    Update complaint status step-by-step
 * @route   PUT /admin/complaint/status/:complaintId
 * @access  Private (Admin)
 */
export const updateComplaintStatus = async (req, res) => {
  try {
    // Authorization check
    if (!(await checkAdmin(req.user))) {
      return res.status(401).send("Unauthorized Only Admin can Access...");
    }

    const complaintId = req.params.complaintId;
    const complaint = await Complaints.findById(complaintId);

    // Complaint existence check
    if (!complaint) {
      return res.status(400).send("Complaints doesn't exist...");
    }

    // Allowed status flow
    const allowedStatuses = [
      "Filed",
      "Acknowledged",
      "In-Progress",
      "Resolved",
    ];

    const currentIndex = allowedStatuses.indexOf(complaint.status);

    // Invalid status check
    if (currentIndex === -1) {
      return res.status(400).send("Invalid Status...");
    }

    // Already resolved check
    if (currentIndex === allowedStatuses.length - 1) {
      return res.status(400).send("Complaint already resolved...");
    }

    // Move to next status
    const nextIndex = currentIndex + 1;
    const status = allowedStatuses[nextIndex];
    complaint.status = status;
    await complaint.save();

    // If resolved, notify user via email
    if (status === "Resolved") {
      const user = await User.findById(complaint.user);
      if (!user) return res.status(400).send("User doesn't exist...");

      await complaintMailResolved(
        user.name,
        complaint.uniqueToken,
        complaint.title,
        user.email
      );
    }

    res.status(200).json({
      msg: "Complaint status updated...",
      status,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
};

/**
 * @desc    Reject a complaint
 * @route   PUT /admin/complaint/reject/:complaintId
 * @access  Private (Admin)
 */
export const rejectComplaint = async (req, res) => {
  try {
    // Authorization check
    if (!(await checkAdmin(req.user))) {
      return res.status(401).send("Unauthorized Only Admin can Access...");
    }

    const complaintId = req.params.complaintId;
    const complaint = await Complaints.findById(complaintId);

    // Complaint existence check
    if (!complaint) {
      return res.status(400).send("Complaints doesn't exist...");
    }

    // Status validation
    if (complaint.status === "Resolved") {
      return res
        .status(400)
        .send("Can't Reject, Complaint already resolved...");
    }

    if (complaint.status === "Rejected") {
      return res.status(400).send("Complaint already Rejected...");
    }

    // Reject complaint
    complaint.status = "Rejected";
    await complaint.save();

    // Free assigned staff (if any)
    if (complaint.assignedTo) {
      const staff = await Staff.findById(complaint.assignedTo);
      if (staff) {
        staff.isActive = false;
        await staff.save();
      }

      // Notify user via email
      const user = await User.findById(complaint.user);
      if (!user) return res.status(400).send("User doesn't exist...");

      await complaintMailRejected(
        user.name,
        complaint.uniqueToken,
        complaint.title,
        user.email
      );
    }

    res.status(200).json({
      msg: "The Complaint Rejected...",
      status: complaint.status,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
};

/**
 * @desc    Assign staff to a complaint
 * @route   PUT /admin/complaint/assign/:complaintId/:staffId
 * @access  Private (Admin)
 */
export const assignStaffToComplaint = async (req, res) => {
  try {
    // Authorization check
    if (!(await checkAdmin(req.user))) {
      return res.status(401).send("Unauthorized Only Admin can Access...");
    }

    const {complaintId, staffId} = req.params;

    const complaint = await Complaints.findById(complaintId);
    if (!complaint) {
      return res.status(400).send("Complaints doesn't exist...");
    }

    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(400).send("Staff doesn't exist...");
    }

    // Staff availability check
    if (staff.isActive) {
      return res.status(400).send("Staff already assigned...");
    }

    // Assign staff
    complaint.assignedTo = staffId;
    await complaint.save();

    staff.isActive = true;
    await staff.save();

    res.status(200).json({
      msg: "Staff assigned successfully...",
      complaint,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
};

/**
 * @desc    Delete a complaint
 * @route   DELETE /admin/complaint/:complaintId
 * @access  Private (Admin)
 */
export const deleteComplaint = async (req, res) => {
  try {
    // Authorization check
    if (!(await checkAdmin(req.user))) {
      return res.status(401).send("Unauthorized Only Admin can Access...");
    }

    const complaintId = req.params.complaintId;
    const complaint = await Complaints.findById(complaintId);

    // Complaint existence check
    if (!complaint) {
      return res.status(400).send("Complaints doesn't exist...");
    }

    await Complaints.findByIdAndDelete(complaintId);

    res.status(200).json({msg: "The Complaint Deleted..."});
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...");
  }
};
