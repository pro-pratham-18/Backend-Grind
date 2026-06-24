

const mongoose =require("mongoose");

const SectionSchema =new mongoose.Schema({                  // specifically agar sirf get request maaar rahe ho tabh bhi schema banana padega even though hum kuch post/update nahi kar rahe , empty schema bana sakte hai for get request.
    sectionName:{
      type:String,
    },
    subSection:[
        {
            type:mongoose.Schema.Types.ObjectId,
            reuired:true,
            ref:"SubSection"
        }
    ],
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


 const SectionModel=mongoose.model("Section",SectionSchema);                                         
 module.exports=SectionModel;  