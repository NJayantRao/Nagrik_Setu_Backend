import express from "express"

import { User } from "../models/users.js"
import { jwtAuthMiddleware,generateToken } from "../jwt.js"

const router= express.Router()
const userRouter= router

//user Signup
router.post("/signup",async (req,res)=>{
    try{
        const data= await req.body
        const newUser= new User(data)
        const response= await newUser.save();
        console.log("User Saved Successfully...");

        const payload= {
            id:response.id,
            email:response.email
        }
        // console.log(JSON.stringify(payload));
        const token= generateToken(payload)
        console.log(token);
        
        res.status(200).json({message:"user Saved Successfully...",token:token})
        
    }catch(error){
        console.log(error);
        res.status(500).send("Internal Server Error...")
        
    }
})

export {userRouter}