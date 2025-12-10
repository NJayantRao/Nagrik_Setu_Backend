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
        minlength:8
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
    uniqueToken:{
        type:String,
        unique:true
    },
    otp:{
        type:String,
        minlength:6,
        maxlength:6
    },
    otpExpiry:{
        type:Date,
    }
},
{timestamps:true});

function generateToken(address){
    const city= address.toUpperCase().slice(0,4).padEnd(4,"X");
    // console.log(city);
    const randomNumber= (10000000+Math.floor(Math.random()*90000000))
    console.log(randomNumber)

    return `CIV-${city}-${randomNumber}`
}

userSchema.pre("save", async function() {
    const user= this;

    //check if pasword is modified or not
    if(user.isModified("password")){

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
    }
    //Unique token
        if(!user.uniqueToken){
            let exists=true;
            let tempToken;
            
            while(exists){
                tempToken= generateToken(user.address)
                exists= await mongoose.models.users.findOne({uniqueToken:tempToken})
            }
            user.uniqueToken= tempToken;
        }
})

userSchema.methods.comparePassword= async function(userPassword){
    try {
        const isMatch= bcrypt.compare(userPassword,this.password)
        return isMatch
    } catch (error) {
        console.log(error);
    }
}

const User= mongoose.model("users",userSchema);

export {User}