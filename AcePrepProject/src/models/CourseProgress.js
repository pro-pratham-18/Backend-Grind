

const mongoose =require("mongoose");

const CourseProgSchema =new mongoose.Schema({                  // specifically agar sirf get request maaar rahe ho tabh bhi schema banana padega even though hum kuch post/update nahi kar rahe , empty schema bana sakte hai for get request.
    courseID:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"Course"
    },
    completedVideos:[{
      type:mongoose.Schema.Types.ObjectId,
      ref:"SubSection"
    }],
    createdAt:{
      type:Date,
      default:Date.now
    }
 });


 

 const CourseProgModel=mongoose.model("CourseProgress",CourseProgSchema);                                         
 module.exports=CourseProgModel;  