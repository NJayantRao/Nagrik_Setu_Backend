import express from "express"

import { Department } from "../models/departments.js"

const router= express.Router()
const departmentRouter= router

//Department Register
router.post("/register",async (req,res)=>{
    try{
        const data= req.body
        const newDepartment= new Department(data)
        const response= await newDepartment.save();
        console.log(response);

        res.status(200).json({msg:"Department Saved...",id:response.id})
        
    }catch(error){
        console.log(error);
        res.status(500).send("Internal Server Error...")
        
    }
})

export {departmentRouter}