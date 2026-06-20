const mongoose =require("mongoose");
 const AuthSchema =new mongoose.Schema({                  // specifically agar sirf get request maaar rahe ho tabh bhi schema banana padega even though hum kuch post/update nahi kar rahe , empty schema bana sakte hai for get request.
    username:{
      type:String,
      trim:true
    },
    email:{
      type:String,
      required:true,
      trim:true
    },
    password:{
      type:String,
      required:true,
      trim:true
    },
    role:{
      type:String,
      enum:["Admin","Student","Visitor"]
    },
    createdAt:{
      type:Date,
      default:Date.now
    }
 });

   //  {collection:"user"}                    // when particuar collection name is required

 const authmodel=mongoose.model("User",AuthSchema);      // line 8: "note" shows that collection on which api requests will get performed , in creation of colection in mongoDB this changes to plural , means it becomes "notes"                                               
 module.exports=authmodel;  // line 8 : if fetching the data from a collection which already exists , then use singular and first letter capital in model name (best practice), model name is basically "notes" here 


 //line 8: model name becomes collection name in a database after lowercasing all letters and making it plural.

 