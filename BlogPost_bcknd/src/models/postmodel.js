const mongoose =require("mongoose");
 const psotSchema =new mongoose.Schema({                  // specifically agar sirf get request maaar rahe ho tabh bhi schema banana padega even though hum kuch post/update nahi kar rahe , empty schema bana sakte hai for get request.
    
    user:{
      type:String,
      required:true
    },
    title:{
      type:String,
      required:true
    },
    body:{
      type:String,
      required:true
    },
    likes :[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Like"
    }],
    comments :[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Comment"
    }],
    createdAt:{
      type:Date,
      default:Date.now
    }
 });

   //  {collection:"user"}                    // when particuar collection name is required

 const postmodel=mongoose.model("Post",psotSchema);      // line 8: "note" shows that collection on which api requests will get performed , in creation of colection in mongoDB this changes to plural , means it becomes "notes"                                               
 module.exports=postmodel;                              // line 8 : if fetching the data from a collection which already exists , then use singular and first letter capital in model name (best practice), model name is basically "notes" here 

 //line 8: model name becomes collection name in a database after lowercasing all letters and making it plural.

 


 