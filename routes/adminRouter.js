import express from "express"

import { Admin } from "../models/admin.js"

const router= express.Router()
const adminRouter= router

//user Signup
router.post("/signup",async (req,res)=>{
    try{
        const data= req.body
        const newAdmin= new Admin(data)
        const response= await newAdmin.save();
        console.log(response);
        
    }catch(error){
        console.log(error);
        res.status(500).send("Internal Server Error...")
        
    }
})

export {adminRouter}