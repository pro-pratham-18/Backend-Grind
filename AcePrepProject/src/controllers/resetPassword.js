const User = require("../models/User");
const mailsender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

// reset password code workflow 



exports.resetPasswordToken = async(req,res)=>{
    try{
        //get email from req body
    const {email}=req.body;
    //check user for this email,email validation 
    const user =  await User.findOne({email :email});
    if(!user){
        return res.json({
            success:false,
            message:"Your Email is Not Registered with us"
        });
    } 
    //generate token
 
    const token = crypto.randomUUID();
    //update user by adding token and expiration time
    const updateDetails = await User.findOneAndUpdate(
        {email:email},
        {
            token:token,
            resetPasswordExpires :Date.now()+5*60*1000,     //expiring time is current date+5 min
        },
        {new :true }
    );

    //create Url
    const url = `http://localhost:3000/update-password/${token}`

    // send the mail containing the url

    await mailsender(
        email,
        "Password Reset Link",
        `Password Reset Link: ${url}`
    );
    // return response 

    return res.json ({
        success:true,
        message:"Email Sent Successfully"
    });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error , Couldn't Reset The Password"
        })
    }
}

exports.resetPassword=async(req,res)=>{
    try{
    //data fetch
    const {password ,confirmPassword,token}=req.body;    // frontend added this token to the body
    //validation
    if(password != confirmPassword){
        return res.status(400).json({
            success:false,
            message:"Password do not match"
        })
    }

    //fetch userdetails from db using token

    const userDetails = await User.findOne({token :token});

    //if no entry in DB - Invalid Token
    if(!userDetails){
        return res.status(400).json({
            success:false,
            message:"Invalid Token"
        }) 
    }

    //token time check(expired or not )
    if(userDetails.resetPasswordExpires<Date.now()){
        return res.status(400).json({
            success:false,
            message:"The Token Expired"
        })
    }
    // hash pwd
    const hashedpassword = await bcrypt.hash(password,10);
    //password update
    await User.findOneAndUpdate(
        {token :token},
        {password : hashedpassword},
        {new :true}
    )
    //return response 
    return res.status(200).json({
        success:true,
        message :"Password reset Successful"
    })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Something Went Wrong While Sending reset pwd mail"
        })
    }
}








