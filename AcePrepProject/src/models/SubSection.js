

const mongoose =require("mongoose");

const SubSectionSchema =new mongoose.Schema({                  // specifically agar sirf get request maaar rahe ho tabh bhi schema banana padega even though hum kuch post/update nahi kar rahe , empty schema bana sakte hai for get request.
    title:{
      type:String,
    },
    timeDuration:{
      type:String,
    },
    videoUrl:{
      type:String,
    },
    description:{
      type:String,
    },
    createdAt:{
      type:Date,
      default:Date.now
    }
 });


 const subSectionModel=mongoose.model("SubSection",SubSectionSchema);                                         
 module.exports=subSectionModel;  