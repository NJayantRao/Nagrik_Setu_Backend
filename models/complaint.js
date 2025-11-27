import mongoose from "mongoose";

const complaintSchema= new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        require:true,
    },
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    imageURL:{
        type:String,
        required:true,
    },
    location: {
        type: { type: String, default: "Point" },
        coordinates: [Number], // [longitude, latitude]
    },
    department:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Department",
        required:true,
    },
    status:{
        type:String,
        enum:["Filed","Acknowledged","In-Progress","Resolved","Resolved"],
        required:true,
    },
    uniqueToken:{
        type:String,
        required:true,
    },
    assignedTo:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Staff",
        required:true,
    },
},
{timestamps:true});

const Complaints= mongoose.model("complaints",complaintSchema);

export {Complaints}