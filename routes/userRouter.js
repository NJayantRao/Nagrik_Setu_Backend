import express from "express"
import cookieParser from "cookie-parser"

import { User } from "../models/users.js"
import { jwtAuthMiddleware,generateToken } from "../jwt.js"
import { sendMail,forgotPasswordMail } from "../utils/resendMail.js"
import { Complaints } from "../models/complaint.js"

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
        // console.log(token);

        const options= {
            httpOnly:true,
            secure:true
        }

        await sendMail(response.name,response.uniqueToken);

        res.status(200).cookie("token",token,options).json({uniqueToken:response.uniqueToken,token:token})
    }catch(error){
        console.log(error);
        res.status(500).send("Internal Server Error...")
        
    }
})

//user login route
router.post("/login",async(req,res)=>{
    try {
        const {uniqueToken,password}= req.body;

    //find user
    const user= await User.findOne({uniqueToken:uniqueToken})

    //if user doesn't exist
    if(!user){
       return res.status(401).send("User doesn't exist")
    }

    //if password is incorrect
    if(!(await user.comparePassword(password))){
       return res.status(401).send("Incorrect password")
    }
    const payload= {
            id:user.id,
            email:user.email
        }

    //jwt token generate
    const token= generateToken(payload)
    // console.log(token);

    const options={
        httpOnly:true,
        secure:true
    }
    res.status(200).cookie("token",token,options).json({uniqueToken:user.uniqueToken,token:token})

    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error...")
    }
})

//view profile
router.get("/profile",jwtAuthMiddleware,async(req,res)=>{
   try {
    const userId= req.user.id
    // console.log(userId);
    const userData= await User.findById(userId)
    console.log(userData);
    res.status(200).send(userData)
   } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...")
   }    
})

//change password
router.put("/profile/changePassword",jwtAuthMiddleware,async (req,res)=>{
   try {
    const {currentPassword,newPassword}= req.body

    //Both Password are required
    if(!currentPassword || !newPassword){
       return res.status(401).send("Enter Both Passwords...")
    }
    const userId= req.user.id
    const user= await User.findById(userId)

    const isMatch= await user.comparePassword(currentPassword)
    //If password is incorrect
    if(!isMatch){
       return res.status(401).send("Incorrect Password...")
    }

    user.password= newPassword;
    await user.save();

    console.log("Password Saved Successfully...");
    
    res.status(200).send("Password Saved Successfully...")
   } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...")
   }
})

//forgot password
router.post("/forgotPassword",async(req,res)=>{
    try {
        const {uniqueToken}= req.body

        const user= await User.findOne({uniqueToken:uniqueToken})

        if(!user)
           return res.status(401).send("User not Found...")

        //function to generate verification code
        const generateRandomCode= ()=>{
            return Math.floor(100000 + Math.random()*900000)
        }
        const verificationCode= generateRandomCode();
        // console.log(verificationCode);

        await forgotPasswordMail(user.name,verificationCode);

        user.otp=verificationCode.toString();
        user.otpExpiry= Date.now() + 10*60*1000;
        await user.save();

        // console.log(user);
        res.status(200).json({otp:user.otp,expiry:user.otpExpiry})
        
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error...")
    }
})

// //reset password
router.put("/resetPassword",async(req,res)=>{
    try {
        const {uniqueToken,otp,newPassword}= req.body

        const user= await User.findOne({uniqueToken:uniqueToken})

        if(!user)
           return res.status(401).send("User not Found...")

        if(!uniqueToken || !otp || !newPassword)
          return  res.status(401).send("Enter all required fields properly...")

        if( user.otp != otp)
           return res.status(401).send("Invalid OTP...")

        if( user.otpExpiry < Date.now())
          return  res.status(401).send("OTP Expired...")

        user.password= newPassword
        
        //clear otp
        user.otp= undefined
        user.otpExpiry= undefined
        await user.save()


        // console.log(user);
        res.status(200).send("Password Saved Successfully...")
        
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error...")
    }
})

//view all complaints
router.get("/profile/complaints",jwtAuthMiddleware,async(req,res)=>{
    try{
        const userId= req.user.id
        const user= await User.findById(userId)
        // console.log(user);
        const complaints= await Complaints.find({user:userId})

        res.status(200).send(complaints)
        
    }catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error...")
    }
})

//logout
router.get("/logout",jwtAuthMiddleware,async (req,res) => {
    try{
        const userId= req.user.id
        const user= await User.findById(userId)
        // console.log(user);
        const options={
        httpOnly:true,
        secure:true
    }

        res.status(200).clearCookie("token",options).send("Logged Out Successfully...")
        
    }catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error...")
    }
})

export {userRouter}