import mongoose from "mongoose";

const staffSchema= new mongoose.Schema({
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
        default:"Staff"
    },
    uniqueId:{
        type:String,
        required:true
    },
    department:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Department",
        required:true,
    },
    isActive:{
        type:Boolean,
        required:true
    }
},
{timestamps:true});

const Staff= mongoose.model("staffs",staffSchema);

export {Staff}