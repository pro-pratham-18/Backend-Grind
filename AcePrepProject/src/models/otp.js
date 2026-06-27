
const mailsender= require("../utils/mailSender")
const mongoose =require("mongoose");

const otpSchema =new mongoose.Schema({                  // specifically agar sirf get request maaar rahe ho tabh bhi schema banana padega even though hum kuch post/update nahi kar rahe , empty schema bana sakte hai for get request.
    email:{
        type :String,
        required:true,
    },
    otp:{
      type:String,
      required:true
    },
    createdAt:{
      type:Date,
      default:Date.now,
      expires:5*60
    }
 });

 // pre middleware

 async function sendverificationEmail(email,otp){
    try{
        const mailResponse = await mailsender(email,"verification Email from AcePrep",otp);
        console.log("Email Sent Successfully :",mailResponse);
    }
    catch(err){
        console.log("error occurred while sending mails:",err);
        throw err;
    }
 }

 otpSchema.pre("save",async function(next){
    await sendverificationEmail(this.email,this.otp);
    next();
 })

 const OtpModel=mongoose.model("OTP",otpSchema);                                         
 module.exports=OtpModel;  
