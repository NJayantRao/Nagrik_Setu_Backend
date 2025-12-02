import jwt from "jsonwebtoken"

const jwtAuthMiddleware= (req,res,next)=>{
    //Check whether the request header has authorization/token or not
    const authorization= req.headers.authorization
    if(!authorization) return res.status(401).send("Token not found...")

    //Extract token from jwt
    const token= req.headers.authorization.split(" ")[1]
    if(!token) return res.status(401).send("Unauthorized request")

    try{
        //Verify token
        const decoded= jwt.verify(token,process.env.JWT_SECRET)
        req.user= decoded;
        next();
    }catch(error){
        console.log(error);
        if (error.name === "TokenExpiredError") {
            return res.status(401).send("Token expired. Please login again.");
        }
        res.status(401).send("Invalid Token")
        
    }
}

//Generate jwt token
const generateToken= (userData)=>{
    return jwt.sign(userData,process.env.JWT_SECRET,{expiresIn: "7d"})
}

export {jwtAuthMiddleware,generateToken}