import express from "express"
import { jwtAuthMiddleware,generateToken } from "../jwt.js"
import { Admin } from "../models/admin.js"
import { sendMail } from "../utils/adminSignupMail.js"

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

// if(!checkAdmin(req.user)){
//             console.log("Only Admin can access");
//             res.status(401).send("Unauthorized Only Admin can Access...")
            
//         }

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

        sendMail(response.name,response.uniqueId)

        res.status(200).json({AdminId:response.uniqueId,token:token})

    }catch(error){
        console.log(error);
        res.status(500).send("Internal Server Error...")
        
    }
})



//admin login route
router.get("/login",async(req,res)=>{
    try {
    const {uniqueId,password}= req.body;

    //find admin
    const admin= await Admin.findOne({uniqueId:uniqueId})

    //if admin doesn't exist
    if(!admin){
        res.status(401).send("Admin doesn't exist")
    }

    //if password is incorrect
    if(!(await admin.comparePassword(password))){
        res.status(401).send("Incorrect password")
    }
    const payload= {
            id:admin.id,
            email:admin.email
        }

    //jwt token generate
    const token= generateToken(payload)

    console.log(token);
    res.status(200).json({uniqueId:admin.uniqueId,token:token})

    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error...")
    }
})

export {adminRouter}