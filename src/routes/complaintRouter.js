import express from "express";
import multer from "multer";

import {Complaints} from "../models/complaint.js";
import {User} from "../models/users.js";
import {jwtAuthMiddleware} from "../middlewares/jwt.js";
import {uploadBufferToCloudinary} from "../utils/cloudinaryUpload.js";
import {sendComplaintMail} from "../utils/complaintMail.js";

const storage = multer.memoryStorage();
const upload = multer({storage});

const router = express.Router();
const complaintRouter = router;

/**
 * ===========================
 * COMPLAINT ROUTES
 * ===========================
 */

/**
 * @route   POST /complaints/register
 * @desc    Register a new complaint with image upload
 * @access  Private
 *
 * @workflow
 * 1. Authenticate user using JWT
 * 2. Accept complaint image via Multer (memory storage)
 * 3. Upload image to Cloudinary
 * 4. Save complaint details to database
 * 5. Send confirmation email to user
 */
router.post(
  "/register",
  jwtAuthMiddleware,
  upload.single("imageURL"),
  async (req, res) => {
    try {
      const data = req.body;

      // Validate image upload
      if (!req.file) {
        return res.status(400).json({error: "Image is required"});
      }

      // Upload image buffer to Cloudinary
      const cloudinaryResult = await uploadBufferToCloudinary(
        req.file.buffer,
        "Nagrik_Setu_Complaints"
      );

      // Attach uploaded image URL
      data.imageURL = cloudinaryResult.secure_url;

      // Attach logged-in user ID
      const userId = req.user.id;
      data.user = userId;

      // Save complaint
      const newComplaint = new Complaints(data);
      const response = await newComplaint.save();
      console.log("Complaint Saved Successfully...");

      // Fetch user details
      const user = await User.findById(userId);

      // Send complaint confirmation email
      await sendComplaintMail(
        user.name,
        response.uniqueToken,
        response.title,
        user.email
      );

      res.status(200).json({
        uniqueToken: response.uniqueToken,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error...");
    }
  }
);

export {complaintRouter};
