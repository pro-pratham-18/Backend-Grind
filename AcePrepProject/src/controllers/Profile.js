const Profile = require("../models/Profile");
const User =require("../models/User");
const Course = require("../models/Course");



exports.updateProfile=async(req,res)=>{
    try{
        //get data
        const {dateOfBirth ="",about ="",contactNumber,gender}=req.body;
        //get userId
        const id = req.user.id;
        //validation
        if(!contactNumber || !gender || !id){
            return res.status(400).json({
                success:false,
                message :"all fields are required"
            })
        }
        //find profile
        const userDetails = await User.findById(id);
        const profileId=userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);
        //update profile
        profileDetails.dateOfBirth=dateOfBirth;
        profileDetails.about= about;
        profileDetails.gender = gender ;
        profileDetails.contactNumber= contactNumber;
        await profileDetails.save();
        //return response
        return res.status(200).json({
            success:true,
            message:"Profile Updated Successfully",
            profileDetails,
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Internal Server Error, Couldn't update the profile",
            error:error.message
        })
    }
}

//delete Account
//explore-> how can we schedule this delete operation cron job 

exports.deleteAccount=async(req,res)=>{
    try{
        //get userId
        const id = req.user.id;

        //find user
        const userDetails = await User.findById(id);
        if(!userDetails){
            return res.status(404).json({
                success:false,
                message:"User not found"
            })
        }

        //delete the linked profile
        const profileId = userDetails.additionalDetails;
        await Profile.findByIdAndDelete(profileId);

        //remove user references from enrolled courses
        await Course.updateMany(
            {studentsEnrolled: id},
            {$pull: {studentsEnrolled: id}}
        );

        //delete the user
        await User.findByIdAndDelete(id);

        //return response
        return res.status(200).json({
            success:true,
            message:"Account Deleted Successfully",
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Internal Server Error, Couldn't delete the account",
            error:error.message
        })
    }
}

exports.getAllUSerDetails = async (req,res)=>{
    try{
        //get id 
        const id = req.user.id;
        //make all the details visible
        const userDetails = await User.findById(id).populate("additionalDetails");
        if(!userDetails){
            return res.status(404).json({
                success:false,
                message:"User not found",
            })
        }
        return res.status(200).json({
            success:true,
            message:"User data fetched successfully",
            data:userDetails,
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Cannot fetch user data",
            error:error.message,
        })
    }
}