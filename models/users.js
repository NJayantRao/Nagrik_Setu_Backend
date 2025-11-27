import mongoose from "mongoose";
import bcrypt from "bcrypt"

const userSchema= new mongoose.Schema({
    name:{
        type:String,
        required: true
    },
    email:{
        type:String,
        required: true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        minlength:8,
        maxlength:20
    },
    phone:{
        type:Number,
        required:true,
        min:10
    },
    address:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:["User","Admin","Staff"],
        default:"User"
    },
    uniqueId:{
        type:String,
        required:true
    },
},
{timestamps:true});

userSchema.pre("save", async function() {
    const user= this;

    //check if pasword is modified or not
    if(!user.isModified("password")) return ;

    //hash password
    try {
        //generate salt
        const salt= await bcrypt.genSalt(10);
        
        //hash password with salt
        const hashPassword= await bcrypt.hash(user.password,salt);
        user.password= hashPassword;
        

    } catch (error) {
        console.log(error);
        
        
    }

})

const User= mongoose.model("users",userSchema);

export {User}