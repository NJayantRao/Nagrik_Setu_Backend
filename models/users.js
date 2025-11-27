import mongoose from "mongoose";

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

const User= mongoose.model("users",userSchema);

export {User}