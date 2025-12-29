import express from "express";
import cookieParser from "cookie-parser";
import {jwtAuthMiddleware} from "../middlewares/jwt.js";
import {Admin} from "../models/admin.js";

/* Admin account controllers */
import {
  adminForgotPassword,
  adminLogin,
  adminLogout,
  adminResetPassword,
  adminSignUp,
  changePasswordAdmin,
  viewAdminProfile,
} from "../controllers/adminControllers.js";

/* Department management controllers */
import {
  deleteDepartment,
  departmentsList,
  registerDepartment,
  updateDepartment,
} from "../controllers/adminDepartments.controllers.js";

/* Staff management controllers */
import {
  deleteStaff,
  registerStaff,
  staffList,
  updateStaff,
} from "../controllers/adminStaffManagement.controllers.js";

/* Complaint management controllers */
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

/**
 * ===========================
 * ADMIN ROUTES
 * ===========================
 *
 * All routes in this file are prefixed with `/admin`
 * Protected routes require a valid JWT token
 */

/* ===========================
   1. ADMIN ACCOUNT MANAGEMENT
   =========================== */

/**
 * @route   POST /admin/signup
 * @desc    Register a new admin
 * @access  Public
 */
router.post("/signup", adminSignUp);

/**
 * @route   POST /admin/login
 * @desc    Login admin and generate JWT
 * @access  Public
 */
router.post("/login", adminLogin);

/**
 * @route   GET /admin/profile
 * @desc    View logged-in admin profile
 * @access  Private (Admin)
 */
router.get("/profile", jwtAuthMiddleware, viewAdminProfile);

/**
 * @route   PUT /admin/profile/changePassword
 * @desc    Change admin password
 * @access  Private (Admin)
 */
router.put("/profile/changePassword", jwtAuthMiddleware, changePasswordAdmin);

/**
 * @route   POST /admin/forgotPassword
 * @desc    Send OTP for admin password reset
 * @access  Public
 */
router.post("/forgotPassword", adminForgotPassword);

/**
 * @route   PUT /admin/resetPassword
 * @desc    Reset admin password using OTP
 * @access  Public
 */
router.put("/resetPassword", adminResetPassword);

/**
 * @route   GET /admin/logout
 * @desc    Logout admin and clear JWT cookie
 * @access  Private (Admin)
 */
router.get("/logout", jwtAuthMiddleware, adminLogout);

/* ===========================
   2. DEPARTMENT MANAGEMENT
   =========================== */

/**
 * @route   POST /admin/department/register
 * @desc    Register a new department
 * @access  Private (Admin)
 */
router.post("/department/register", jwtAuthMiddleware, registerDepartment);

/**
 * @route   GET /admin/departments
 * @desc    Get list of all departments
 * @access  Private (Admin)
 */
router.get("/departments", jwtAuthMiddleware, departmentsList);

/**
 * @route   PUT /admin/department/:departmentId
 * @desc    Update department details
 * @access  Private (Admin)
 */
router.put("/department/:departmentId", jwtAuthMiddleware, updateDepartment);

/**
 * @route   DELETE /admin/department/:departmentId
 * @desc    Delete a department
 * @access  Private (Admin)
 */
router.delete("/department/:departmentId", jwtAuthMiddleware, deleteDepartment);

/* ===========================
   3. STAFF MANAGEMENT
   =========================== */

/**
 * @route   POST /admin/staff/register
 * @desc    Register a new staff member
 * @access  Private (Admin)
 */
router.post("/staff/register", jwtAuthMiddleware, registerStaff);

/**
 * @route   GET /admin/staff
 * @desc    Get list of all staff members
 * @access  Private (Admin)
 */
router.get("/staff", jwtAuthMiddleware, staffList);

/**
 * @route   PUT /admin/staff/:staffId
 * @desc    Update staff details
 * @access  Private (Admin)
 */
router.put("/staff/:staffId", jwtAuthMiddleware, updateStaff);

/**
 * @route   DELETE /admin/staff/:staffId
 * @desc    Delete a staff member
 * @access  Private (Admin)
 */
router.delete("/staff/:staffId", jwtAuthMiddleware, deleteStaff);

/* ===========================
   4. COMPLAINT MANAGEMENT
   =========================== */

/**
 * @route   GET /admin/complaints
 * @desc    Get list of all complaints
 * @access  Private (Admin)
 */
router.get("/complaints", jwtAuthMiddleware, complaintsList);

/**
 * @route   GET /admin/complaints/:complaintId
 * @desc    Get complaint details by ID
 * @access  Private (Admin)
 */
router.get("/complaints/:complaintId", jwtAuthMiddleware, getComplaintById);

/**
 * @route   PUT /admin/complaints/:complaintId/status/next
 * @desc    Move complaint to next status
 * @access  Private (Admin)
 */
router.put(
  "/complaints/:complaintId/status/next",
  jwtAuthMiddleware,
  updateComplaintStatus
);

/**
 * @route   PUT /admin/complaints/:complaintId/status/reject
 * @desc    Reject a complaint
 * @access  Private (Admin)
 */
router.put(
  "/complaints/:complaintId/status/reject",
  jwtAuthMiddleware,
  rejectComplaint
);

/**
 * @route   PUT /admin/complaints/:complaintId/assignedTo/:staffId
 * @desc    Assign staff to a complaint
 * @access  Private (Admin)
 */
router.put(
  "/complaints/:complaintId/assignedTo/:staffId",
  jwtAuthMiddleware,
  assignStaffToComplaint
);

/**
 * @route   DELETE /admin/complaints/:complaintId
 * @desc    Delete a complaint
 * @access  Private (Admin)
 */
router.delete("/complaints/:complaintId", jwtAuthMiddleware, deleteComplaint);

export {adminRouter};
