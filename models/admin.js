import mongoose from "mongoose";
import bcrypt from "bcrypt"

const adminSchema= new mongoose.Schema({
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
        default:"Admin"
    },
    uniqueId:{
        type:String,
        unique:true
    },
},
{timestamps:true});


function generateToken(address){
    const city= address.toUpperCase().slice(0,4).padEnd(4,"X");
    // console.log(city);
    const randomNumber= (10000000+Math.floor(Math.random()*90000000))
    console.log(randomNumber)

    return `ADM-${city}-${randomNumber}`
}

adminSchema.pre("save", async function() {
    const admin= this;

    //check if pasword is modified or not
    if(admin.isModified("password")){

    //hash password
    try {
        //generate salt
        const salt= await bcrypt.genSalt(10);
        
        //hash password with salt
        const hashPassword= await bcrypt.hash(admin.password,salt);
        admin.password= hashPassword;
    } catch (error) {
        console.log(error);   
    }
    }
    //Unique token
        if(!admin.uniqueId){
            let exists=true;
            let tempToken;
            
            while(exists){
                tempToken= generateToken(admin.address)
                exists= await mongoose.models.admins.findOne({uniqueToken:tempToken})
            }
            admin.uniqueId= tempToken;
        }
})

adminSchema.methods.comparePassword= async function(adminPassword){
    try {
        const isMatch= bcrypt.compare(adminPassword,this.password)
        return isMatch
    } catch (error) {
        console.log(error);
    }
}

const Admin= mongoose.model("admins",adminSchema);

export {Admin}