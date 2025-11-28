import express from "express"

import { Complaints } from "../models/complaint.js"
import { jwtAuthMiddleware,generateToken } from "../jwt.js"

const router= express.Router()
const complaintRouter= router

//complaint register
router.post("/register",async (req,res)=>{
    try{
        const data= await req.body
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