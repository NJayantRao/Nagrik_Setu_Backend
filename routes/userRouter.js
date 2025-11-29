import express from "express"

import { User } from "../models/users.js"
import { jwtAuthMiddleware,generateToken } from "../jwt.js"
import { sendMail } from "../utils/resendMail.js"

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

        sendMail(response.name,response.uniqueToken);
        
        res.status(200).json({uniqueToken:response.uniqueToken,token:token})
        
    }catch(error){
        console.log(error);
        res.status(500).send("Internal Server Error...")
        
    }
})

//user login route
router.get("/login",async(req,res)=>{
    try {
        const {uniqueToken,password}= req.body;

    //find user
    const user= await User.findOne({uniqueToken:uniqueToken})

    //if user doesn't exist
    if(!user){
        res.status(401).send("User doesn't exist")
    }

    //if password is incorrect
    if(!(await user.comparePassword(password))){
        res.status(401).send("Incorrect password")
    }
    const payload= {
            id:user.id,
            email:user.email
        }

    //jwt token generate
    const token= generateToken(payload)

    console.log(token);
    res.status(200).json({uniqueToken:user.uniqueToken,token:token})

    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error...")
    }
})

//view profile


//change password

//forgot password

//view complaints

//logout

export {userRouter}