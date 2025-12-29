import express from "express";
import cookieParser from "cookie-parser";

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
import {
  adminForgotPassword,
  adminLogin,
  adminLogout,
  adminResetPassword,
  adminSignUp,
  changePasswordAdmin,
  viewAdminProfile,
} from "../controllers/adminControllers.js";
import {
  deleteDepartment,
  departmentsList,
  registerDepartment,
  updateDepartment,
} from "../controllers/adminDepartments.controllers.js";
import {
  deleteStaff,
  registerStaff,
  staffList,
  updateStaff,
} from "../controllers/adminStaffManagement.controllers.js";
import {
  assignStaffToComplaint,
  complaintsList,
  deleteComplaint,
  getComplaintById,
  rejectComplaint,
  updateComplaintStatus,
} from "../controllers/adminComplaints.controllers.js";

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
router.get("/profile", jwtAuthMiddleware, viewAdminProfile);

//admin change password
router.put("/profile/changePassword", jwtAuthMiddleware, changePasswordAdmin);

//admin forgot password
router.post("/forgotPassword", adminForgotPassword);

//admin reset password
router.put("/resetPassword", adminResetPassword);

//logout
router.get("/logout", jwtAuthMiddleware, adminLogout);

//2. Department management routes
//Department register
router.post("/department/register", jwtAuthMiddleware, registerDepartment);

//List of all Department
router.get("/departments", jwtAuthMiddleware, departmentsList);

//update Department
router.put("/department/:departmentId", jwtAuthMiddleware, updateDepartment);
//delete Department
router.delete("/department/:departmentId", jwtAuthMiddleware, deleteDepartment);

//3.Staff management routes
//create Staff
router.post("/staff/register", jwtAuthMiddleware, registerStaff);

//List of all Staff
router.get("/staff", jwtAuthMiddleware, staffList);

//update Staff info
router.put("/staff/:staffId", jwtAuthMiddleware, updateStaff);

//delete Staff
router.delete("/staff/:staffId", jwtAuthMiddleware, deleteStaff);

//4.complaints management routes
//List of all complaints
router.get("/complaints", jwtAuthMiddleware, complaintsList);

// get complaints by id
router.get("/complaints/:complaintId", jwtAuthMiddleware, getComplaintById);

//update complaints status need refactoring
router.put(
  "/complaints/:complaintId/status/next",
  jwtAuthMiddleware,
  updateComplaintStatus
);

//update complaint status for rejection
router.put(
  "/complaints/:complaintId/status/reject",
  jwtAuthMiddleware,
  rejectComplaint
);

//update complaints assign staff
router.put(
  "/complaints/:complaintId/assignedTo/:staffId",
  jwtAuthMiddleware,
  assignStaffToComplaint
);

//delete complaints
router.delete("/complaints/:complaintId", jwtAuthMiddleware, deleteComplaint);

export {adminRouter};
