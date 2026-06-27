

const mongoose =require("mongoose");

const RatingReviewSchema =new mongoose.Schema({                  // specifically agar sirf get request maaar rahe ho tabh bhi schema banana padega even though hum kuch post/update nahi kar rahe , empty schema bana sakte hai for get request.
    user:{
        type :mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User",
    },
    rating:{
      type:Number,
      required:true
    },
    review:{
        type :String,
        required:true,
    },
    createdAt:{
      type:Date,
      default:Date.now
    }
 });


 const RatingAndReviewModel=mongoose.model("RatingAndReviews",RatingReviewSchema);                                         
 module.exports=RatingAndReviewModel;  
