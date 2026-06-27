

const mongoose =require("mongoose");

const tagSchema =new mongoose.Schema({                  // specifically agar sirf get request maaar rahe ho tabh bhi schema banana padega even though hum kuch post/update nahi kar rahe , empty schema bana sakte hai for get request.
    name:{
        type :String,
        required:true,
    },
    description:{
      type:String,
    },
    courses:{
        type :mongoose.Schema.Types.ObjectId,
        ref:"Course"
    },
    createdAt:{
      type:Date,
      default:Date.now
    }
 });


 const TagModel=mongoose.model("Tags",tagSchema);                                         
 module.exports=TagModel;  
