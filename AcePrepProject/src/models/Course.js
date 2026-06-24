

const mongoose =require("mongoose");

const CourseSchema =new mongoose.Schema({                  // specifically agar sirf get request maaar rahe ho tabh bhi schema banana padega even though hum kuch post/update nahi kar rahe , empty schema bana sakte hai for get request.
    courseName:{
      type:String
    },
    courseDescription:{
      type:String
    },
    instructor:{
        type :mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    whatYouWillLearn:{
        type:String,
    },
    courseContent:[
        {
            type :mongoose.Schema.Types.ObjectId,
            ref:"Sectoin",
        }
    ],
    ratingAndReviews:[{
        type :mongoose.Schema.Types.ObjectId,
        ref:"RatingAndReviews",
    }],
    price:{
        type:Number,
    },
    thumbnail:{
        type : String,
    },
    tag :{
        type :mongoose.Schema.Types.ObjectId,
        ref:"Tags",
    },
    studentsEnrolled:[{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User",
    }],
    createdAt:{
      type:Date,
      default:Date.now
    }
 });


 const CourseModel=mongoose.model("Course",CourseSchema);                                         
 module.exports=CourseModel;  
