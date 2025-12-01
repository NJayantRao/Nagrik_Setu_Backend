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
        enum:["Filed","Acknowledged","In-Progress","Resolved","Rejected"],
        default:"Filed",
    },
    uniqueToken:{
        type:String,
        unique:true,
    },
    assignedTo:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Staff",
        required:true,
    },
},
{timestamps:true});

function generateToken(department){
    const dept= department.toUpperCase().slice(0,4).padEnd(4,"X");
    // console.log(dept);
    const randomNumber= (10000000+Math.floor(Math.random()*90000000))
    // console.log(randomNumber)

    return `COM-${dept}-${randomNumber}`
}

complaintSchema.pre("save", async function() {
    const complaint= this;
    const deptDoc = await mongoose.models.departments.findById(complaint.department);
    if (!deptDoc) throw new Error("Invalid department");
    //Unique token
        if(!complaint.uniqueToken){
            let exists=true;
            let tempToken;
            
            while(exists){
                tempToken= generateToken(deptDoc.name)
                exists= await mongoose.models.complaints.findOne({uniqueToken:tempToken})
            }
            complaint.uniqueToken= tempToken;
        }
})

const Complaints= mongoose.model("complaints",complaintSchema);

export {Complaints}