const jwt = require("jsonwebtoken");

require("dotenv").config();

const User = require("../models/User")


exports.Auth= (req,res,next)=>{
    try{
        // extract data from the cookie
        const token = req.cookies?.token || req.body?.token || req.header("Authorization")?.replace("Bearer ","");
        console.log("cookies",req.cookies.token);
        // console.log(req.headers);       // to get the info if you are sending the token using the authorization header
        if(!token){
            return res.status(401).json({
                success:false,
                message :"The Token Is Missing"
            })
        }
        // verify the token
        try{
            const decoded = jwt.verify(token,process.env.JWT_SECRET);        // the decode here is basically the payload which we gave earlier , also includes the creating time and expiration time of the token
            console.log(decoded);
            req.user=decoded;
        }
        catch(err){
            console.log(err);
            return res.status(401).json({
                success:false,
                message:"token Expired"
            })
        }
        next();
    }


    catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message :"Verification Of the token failed Due To Internal server Error"
        });
    }
}
exports.IsStudent = (req,res,next)=>{
    try{
        if(req.user.accountType!=="Student"){
            return res.status(403).json({
                success:false,
                message:"Only The Students Are Authorized To access"
            })
        }
        next();
    }
    catch(err){
        console.error(err);
        return res.status(500).json({
            success:false,
            message :"Couldn't Authorize"
        })
    }
}

exports.IsAdmin= (req,res,next)=>{
    try{
        if(req.user.accountType!=="Admin"){
            return res.status(403).json({
                success:false,
                message:"Only The Admins Are Authorized To access"
            })
        }
        next();
    }
    catch(err){
        console.error(err);
        return res.status(500).json({
            success:false,
            message :"Couldn't Authorize"
        })
    }
}

exports.IsInstructor= (req,res,next)=>{
    try{
        if(req.user.accountType!=="Instructor"){
            return res.status(403).json({
                success:false,
                message:"Only The Instructors Are Authorized To access"
            })
        }
        next();
    }
    catch(err){
        console.error(err);
        return res.status(500).json({
            success:false,
            message :"Couldn't Authorize"
        })
    }
}
