

const mongoose =require("mongoose");

const ProfileSchema =new mongoose.Schema({                  // specifically agar sirf get request maaar rahe ho tabh bhi schema banana padega even though hum kuch post/update nahi kar rahe , empty schema bana sakte hai for get request.
    gender:{
      type:String,
      required:true,
      trim:true
    },
    dateOfBirth:{
      type:String,
    },
    about:{
      type:String,
      trim:true
    },
    contactNumber:{
      type:String,
      required:true
    },
    accountType:{
      type:Number,
      required:true,
    },
    createdAt:{
      type:Date,
      default:Date.now
    }
 });


 const profileModel=mongoose.model("Profile",ProfileSchema);                                         
 module.exports=profileModel;  