import express from "express"

import { User } from "../models/users.js"

const router= express.Router()
const userRouter= router

//user Signup
router.post("/signup",async (req,res)=>{
    try{
        const data= await req.body
        const newUser= new User(data)
        const response= await newUser.save();
        console.log(response);
        
    }catch(error){
        console.log(error);
        res.status(500).send("Internal Server Error...")
        
    }
})

export {userRouter}