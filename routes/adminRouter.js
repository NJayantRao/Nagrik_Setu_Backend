import express from "express"
import cookieParser from "cookie-parser"

import { jwtAuthMiddleware,generateToken } from "../jwt.js"
import { Admin } from "../models/admin.js"
import { Department } from "../models/departments.js"
import { sendMail,forgotPasswordMail } from "../utils/adminSignupMail.js"

const router= express.Router()
const adminRouter= router

 async function checkAdmin(admin){
try{
    const cand= await Admin.findById(admin.id);
    return cand.role === "Admin"
}catch(error){
    return false
}
}

//1.admin account management routes
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
        const options={
            httpOnly:true,
            secure:true
        }

        await sendMail(response.name,response.uniqueId)

        res.status(200).cookie("token",token,options).json({AdminId:response.uniqueId,token:token})

    }catch(error){
        console.log(error);
        res.status(500).send("Internal Server Error...")
        
    }
})

//admin login route
router.post("/login",async(req,res)=>{
    try {
    const {uniqueId,password}= req.body;

    //find admin
    const admin= await Admin.findOne({uniqueId:uniqueId})

    //if admin doesn't exist
    if(!admin){
        return res.status(401).send("Admin doesn't exist")
    }

    //if password is incorrect
    if(!(await admin.comparePassword(password))){
       return res.status(401).send("Incorrect password")
    }
    const payload= {
            id:admin.id,
            email:admin.email
        }

    //jwt token generate
    const token= generateToken(payload)
    console.log(token);
    const options={
        httpOnly:true,
        secure:true
    }
    
    res.status(200).cookie("token",token,options).json({uniqueId:admin.uniqueId,token:token})

    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error...")
    }
})

//admin profile view
router.get("/profile",jwtAuthMiddleware,async(req,res)=>{
   try {
     if(!checkAdmin(req.user)){
            console.log("Only Admin can access");
            return res.status(401).send("Unauthorized Only Admin can Access...")
        }
    const adminId= req.user.id
    // console.log(adminId);
    const adminData= await Admin.findById(adminId)
    console.log(adminData);

    res.status(200).send(adminData)
   } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...")
   }    
})

//admin change password
router.put("/profile/changePassword",jwtAuthMiddleware,async (req,res)=>{
   try {
     if(!checkAdmin(req.user)){
            console.log("Only Admin can access");
            return res.status(401).send("Unauthorized Only Admin can Access...")
        }

    const {currentPassword,newPassword}= req.body

    //Both Password are required
    if(!currentPassword || !newPassword){
       return res.status(401).send("Enter Both Passwords...")
    }
    const adminId= req.user.id
    const admin= await Admin.findById(adminId)

    const isMatch= await admin.comparePassword(currentPassword)
    //If password is incorrect
    if(!isMatch){
       return res.status(401).send("Incorrect Password...")
    }

    admin.password= newPassword;
    await admin.save();

    console.log("Password Saved Successfully...");
    
    res.status(200).send("Password Saved Successfully...")
   } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error...")
   }
})

//admin forgot password
router.post("/forgotPassword",async(req,res)=>{
    try {
        const {uniqueId}= req.body

        const admin= await Admin.findOne({uniqueId:uniqueId})

        if(!admin)
           return res.status(401).send("Admin not Found...")

        //function to generate verification code
        const generateRandomCode= ()=>{
            return Math.floor(100000 + Math.random()*900000)
        }
        const verificationCode= generateRandomCode();
        // console.log(verificationCode);

         await forgotPasswordMail(admin.name,verificationCode);

        admin.otp=verificationCode.toString();
        admin.otpExpiry= Date.now() + 10*60*1000;
        await admin.save();

        // console.log(admin);
        res.status(200).json({otp:admin.otp,expiry:admin.otpExpiry})
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error...")
    }
})

//admin reset password
router.put("/resetPassword",async(req,res)=>{
    try {
        const {uniqueId,otp,newPassword}= req.body

        const admin= await Admin.findOne({uniqueId:uniqueId})

        if(!admin)
           return res.status(401).send("Admin not Found...")

        if(!uniqueId || !otp || !newPassword)
          return  res.status(401).send("Enter all required fields properly...")

        if( admin.otp != otp)
           return res.status(401).send("Invalid OTP...")

        if( admin.otpExpiry < Date.now())
          return  res.status(401).send("OTP Expired...")

        admin.password= newPassword
        
        //clear otp
        admin.otp= undefined
        admin.otpExpiry= undefined
        await admin.save()


        // console.log(admin);
        res.status(200).send("Password Saved Successfully...")
        
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error...")
    }
})

//logout
router.get("/logout",jwtAuthMiddleware,async (req,res) => {
    try{
        const adminId= req.user.id
        const admin= await Admin.findById(adminId)
        // console.log(admin);
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

//2. Department management routes
//Department register
router.post("/department/register",jwtAuthMiddleware,async (req,res)=>{
    try{
        if(!checkAdmin(req.user)){
            console.log("Only Admin can access");
            return res.status(401).send("Unauthorized Only Admin can Access...")
        }
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

//List of all Department 
router.get("/department",jwtAuthMiddleware,async (req,res) => {
    try{
        if(!checkAdmin(req.user)){
            console.log("Only Admin can access");
            return res.status(401).send("Unauthorized Only Admin can Access...")
        }

        const departmentList= await Department.find().sort({createdAt:-1})
        // console.log(departmentList);

        res.status(200).json({msg:"Department List is...",departmentList:departmentList})
        
    }catch(error){
        console.log(error);
        res.status(500).send("Internal Server Error...")
    }
})

//update Department 
router.put("/department/:departmentId",jwtAuthMiddleware,async (req,res) => {
    try{
        if(!checkAdmin(req.user)){
            console.log("Only Admin can access");
            return res.status(401).send("Unauthorized Only Admin can Access...")
        }

        const departmentId= req.params.departmentId;
        // console.log(departmentId);
        const department= await Department.findById(departmentId)

        if(!department){
            return res.status(401).send("Department not Found...")
        }
        const updatedDepartmentInfo= req.body
        const response= await Department.findByIdAndUpdate(departmentId,updatedDepartmentInfo,{
            new:true,
            runValidators:true
        })
        res.status(200).json({msg:"Department Updated...",response:response})
        
    }catch(error){
        console.log(error);
        res.status(500).send("Internal Server Error...")
    }
})
//delete Department 
router.delete("/department/:departmentId",jwtAuthMiddleware,async (req,res) => {
    try{
        if(!checkAdmin(req.user)){
            console.log("Only Admin can access");
            return res.status(401).send("Unauthorized Only Admin can Access...")
        }
        const departmentId= req.params.departmentId;
        // console.log(departmentId);
         const department= await Department.findById(departmentId)

        if(!department){
            return res.status(401).send("Department not Found...")
        }
        const response= await Department.findByIdAndDelete(departmentId)
        res.status(200).send("Department Deleted...")
        
    }catch(error){
        console.log(error);
        res.status(500).send("Internal Server Error...")
    }
})

//3.Staff management routes
//create Staff 
//List of all Staff 
//update Staff 
//update Staff status
//delete Staff 

//4.complaints management routes
//List of all complaints 
// get complaints by id
//update complaints status
//update complaints assign staff
//delete complaints 

export {adminRouter}