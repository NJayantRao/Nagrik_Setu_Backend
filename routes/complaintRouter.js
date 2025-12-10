import express from "express";
import multer from "multer";

import { Complaints } from "../models/complaint.js";
import { User } from "../models/users.js";
import { jwtAuthMiddleware, generateToken } from "../jwt.js";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.js";
import { sendComplaintMail } from "../utils/complaintMail.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();
const complaintRouter = router;

//complaint register
router.post(
  "/register",
  jwtAuthMiddleware,
  upload.single("imageURL"),
  async (req, res) => {
    try {
      const data = req.body;
      if (!req.file) {
        return res.status(400).json({ error: "Image is required" });
      }
      const cloudinaryResult = await uploadBufferToCloudinary(
        req.file.buffer,
        "Nagrik_Setu_Complaints"
      );
      data.imageURL = cloudinaryResult.secure_url;
      const userid = req.user.id;
      data.user = userid;

      const newComplaint = new Complaints(data);
      const response = await newComplaint.save();
      console.log("Complaint Saved Successfully...");

      //getting user info
      const user = await User.findById(userid);
      // console.log(user);

      //Sending mail
      await sendComplaintMail(
        user.name,
        response.uniqueToken,
        response.title,
        user.email
      );

      res.status(200).json({ uniqueToken: response.uniqueToken });
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error...");
    }
  }
);

export { complaintRouter };
