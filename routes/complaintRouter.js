import express from "express"
import multer from "multer"

import { Complaints } from "../models/complaint.js"
import { jwtAuthMiddleware,generateToken } from "../jwt.js"
import {uploadBufferToCloudinary} from "../utils/cloudinaryUpload.js"

const storage= multer.memoryStorage();
const upload=multer({storage})


const router= express.Router()
const complaintRouter= router

//complaint register
router.post("/register",upload.single("imageURL"),async (req,res)=>{
    try{
        const data= await req.body
        if (!req.file) {
      return res.status(400).json({ error: "Image is required" });
    }
      const cloudinaryResult= await uploadBufferToCloudinary(req.file.buffer,"Nagrik_Setu_Complaints")
      data.imageURL= cloudinaryResult.secure_url;
    
        const newComplaint= new Complaints(data)
        const response= await newComplaint.save();
        console.log("Complaint Saved Successfully...");

        const payload= {
            id:response.id,
            department:response.department
        }
        // console.log(JSON.stringify(payload));
        const token= generateToken(payload)
        console.log(token);
        
        res.status(200).json({uniqueToken:response.uniqueToken,token:token})
        
    }catch(error){
        console.log(error);
        res.status(500).send("Internal Server Error...")
        
    }
})

export {complaintRouter}