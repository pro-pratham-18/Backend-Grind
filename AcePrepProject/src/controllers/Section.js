const Section = require("../models/Section");
const Course = require("../models/Course")

exports.createSection=async(req,res)=>{
    try{
        //data fetch
        const {sectionName ,courseId}=req.body;

        //data validation
        if(!sectionName || !courseId){
            return res.status(400).json({
                success:false,
                message:"Missing Properties",
            });
        }
        // create Section 
        const newSection =await Section.create({
            sectionName
        });
        //update course with section ObjectId 
        const updatedCourseDetails = await Course.findByIdAndUpdate(
            courseId,
            {
                $push:{
                    courseContent :newSection._id,
                }

        },
        {new:true}
    );                   // add populate here such that both section and the sub section gets opened

    //return response

    return res.status(200).json({
        success:true,
        message :"Section Created Successfully",
        updatedCourseDetails,
    })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Unable to Create the Section",
        })
    }
}

exports.updateSection=async (req,res)=>{
    try{
        //data input 
        const {sectionName,sectionId}=req.body;
        //data validation 
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success:false,
                message:"Missing Properties",
            });
        }
        //update data
        const section= await Section.findByIdAndUpdate(sectionId,{sectionName},{new:true})
        //return response

        //return res
        return res.status(200).json({
            success:true,
            message:"Section Updated Successfully",
        });

    }
    catch(error){
        return res.status(500).json({
            success:false,
            message :"Unable to update Section , please try again",
            error:error.message,
        });
    }

}

exports.deleteSection=async(req,res)=>{
    try{
        //get Id-assuming that we are sending ID is params
        const {sectionId}=req.body;
        //use findbyIdAndDelete
        await Section.findByIdAndDelete(sectionId);
        //todo(testing): do we need to delete the entry from the course Schema
        //return response
        return res.status(200).json({
            success:true,
            message:"Section Deleted Successfully",
        })
        //
    }
   catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to Delete Section ,please try again",
            error:error.message,
        })
    }
}

exports.getSectionDetails=async(req,res)=>{
    try{
        const {sectionId}=req.body;
        if(!sectionId){
            return res.status(400).json({
                success:false,
                message:"Section id is required",
            });
        }
        const sectionDetails = await Section.findById(sectionId)
            .populate("subSection")
            .exec();
        if(!sectionDetails){
            return res.status(404).json({
                success:false,
                message:"Section not found",
            });
        }
        return res.status(200).json({
            success:true,
            message:"Section details fetched successfully",
            data:sectionDetails,
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Cannot fetch section details",
            error:error.message,
        });
    }
}