const Course =require("../models/Course");
require("dotenv").config();

const Tag = require("../models/tags");
const User = require("../models/User");
const {uploadFileToCloudinary} = require("../utils/imageUploader");

//two functions here one to create the course and one to fetch it

//create Course

exports.createCourse=async(req,res)=>{
    try{
        //fetch data 
        const {courseName,courseDescription,whatYouWillLearn,price,tag}=req.body;

        //get thumbnail 

        const thumbnail=req.files.thumbnailImage;

        //validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbnail ){
            return res.status(400).json({
                success:false ,
                message:"All fields are required"
            })
        }

        //check for instructor
        const userId=req.user.id;                                    // as we put the id in the req.user in the auth middleware   
        const instructorDetails= await User.findById(userId);
        console.log("Instructor Details :",instructorDetails);

        //if instructor details not found

        if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message:"Instructor Details Not Found"
            });
        }

        //check given tag is valid or not 
        const tagDetails = await Tag.findById(tag);
        if(!tagDetails){
            return res.status(404).json({
                success:false,
                message:"Tag Details Not Found",
            });
        }
        //upload image to cloudinary

        const thumbnailImage= await uploadFileToCloudinary(thumbnail,process.env.FOLDER_NAME);

        // create an entry for the new course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor:instructorDetails._id,
            whatYouWillLearn:whatYouWillLearn,
            tag:tagDetails._id,
            thumbnail:thumbnailImage.secure_url,
        });
        
        // add the new course to the user schema of the instructor

        await User.findByIdAndUpdate(
            {_id:instructorDetails._id},
            {
                $push:{
                    courses:newCourse._id,
                }
            },
            {new:true},
        );

        // update the  Tag Ka Schema
        //TODO :HW
        
        //return response

        return res.status(200).json({
            success:true,
            message:"Course Created Successfully",
            data:newCourse,
        });
    }
    catch(error){
        console.error(error);
        return res.status(500).json({
            success:false,
            message:"failed To create Course",
            error:error.message,
        })
    }
}


exports.getAllCourses=async(req,res)=>{
    try{
        const allCourses = await Course.find({}, { courseName:true,price:true,thumbnail:true,instructor:true,ratingAndReviews:true,studentsEnrolled:true}).populate("instructor");
        return res.status(200).json({
            success:true,
            message:"Data for all courses fetched successfully",
            data:allCourses,
    })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success :false,
            message :"cannot fetch course data",
            error:error.message,
        })
    }
}

exports.getCourseDetails=async(req,res)=>{
    try{
        const {courseId}=req.body;
        if(!courseId){
            return res.status(400).json({
                success:false,
                message:"Course id is required",
            });
        }
        const courseDetails = await Course.findById(courseId)
            .populate({
                path:"courseContent",
                populate:{
                    path:"subSection",
                }
            })
            .populate("instructor")
            .populate("ratingAndReviews")
            .populate("studentsEnrolled")
            .populate("tag")
            .exec();
        if(!courseDetails){
            return res.status(404).json({
                success:false,
                message:"Course not found",
            });
        }
        return res.status(200).json({
            success:true,
            message:"Course details fetched successfully",
            data:courseDetails,
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Cannot fetch course details",
            error:error.message,
        });
    }
}

