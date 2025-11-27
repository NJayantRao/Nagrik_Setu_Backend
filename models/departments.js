import mongoose from "mongoose";

const departmentSchema= new mongoose.Schema({
   name:{
    type:String,
    required: true
   },
   description:{
    type:String,
    required: true
   }
},
{timestamps:true});

const Department= mongoose.model("departments",departmentSchema);

export {Department}