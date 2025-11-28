import express from "express"

import { Staff } from "../models/staff.js"
import { jwtAuthMiddleware,generateToken } from "../jwt.js"

const router= express.Router()
const staffRouter= router

//staff Signup
router.post("/register",async (req,res)=>{
    try{
        const data= await req.body
        const newStaff= new Staff(data)
        const response= await newStaff.save();
        console.log("Staff Saved Successfully...");

        const payload= {
            id:response.id,
            email:response.email
        }
        // console.log(JSON.stringify(payload));
        const token= generateToken(payload)
        console.log(token);
        
        res.status(200).json({uniqueId:response.uniqueId,token:token})
        
    }catch(error){
        console.log(error);
        res.status(500).send("Internal Server Error...")
        
    }
})

export {staffRouter}