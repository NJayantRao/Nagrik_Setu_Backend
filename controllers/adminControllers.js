
import { jwtAuthMiddleware,generateToken } from "../jwt.js"
import { User } from "../models/users.js"
import { Admin } from "../models/admin.js"
import { Department } from "../models/departments.js"
import { Complaints } from "../models/complaint.js"
import { Staff } from "../models/staff.js"
import { sendMail,forgotPasswordMail,sendStaffMail } from "../utils/adminMail.js"
import { complaintMailResolved,complaintMailRejected } from "../utils/complaintMail.js"

async function checkAdmin(admin){
try{
    const cand= await Admin.findById(admin.id);
    return cand.role === "Admin"
}catch(error){
    return false
}
}

export const adminSignUp= async (req,res)=>{
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

        await sendMail(response.name,response.uniqueId,response.email)

        res.status(200).cookie("token",token,options).json({AdminId:response.uniqueId,token:token})

    }catch(error){
        console.log(error);
        if(error.code === 11000){
            console.log("User already exists");
            return res.status(400).send("Admin Already Exists. Please Login")
            
        }else{
        res.status(500).send("Internal Server Error...")
        }
    }
}

export const adminLogin= async(req,res)=>{
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
}

export const adminForgotPassword= async(req,res)=>{
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

        //  await forgotPasswordMail(admin.name,verificationCode,admin.email);

        admin.otp=verificationCode.toString();
        admin.otpExpiry= Date.now() + 10*60*1000;
        await admin.save();

        // console.log(admin);
        res.status(200).json({otp:admin.otp,expiry:admin.otpExpiry})
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error...")
    }
}

export const adminResetPassword= async(req,res)=>{
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
}