import express from "express"
import { jwtAuthMiddleware,generateToken } from "../jwt.js"
import { Admin } from "../models/admin.js"

const router= express.Router()
const adminRouter= router

//admin Signup
router.post("/signup",async (req,res)=>{
    try{
        const data= req.body
        const newAdmin= new Admin(data)
        const response= await newAdmin.save();
        // console.log(response);
        const payload= {
            id:response.id,
            email:response.email
        }
        const token= generateToken(payload)
        res.status(200).json({AdminId:response.uniqueId,token:token})
        
    }catch(error){
        console.log(error);
        res.status(500).send("Internal Server Error...")
        
    }
})

export {adminRouter}