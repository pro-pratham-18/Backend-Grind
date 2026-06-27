const SubSection = require("../models/SubSection");
const Section = require("../models/Section");

const {uploadFileToCloudinary}=require("../utils/imageUploader")

//create subsection logic

exports.createSubsection=async (req,res)=>{
    try{
        //fetch data from req body
        const {sectionId,title,timeDuration,description }=req.body;
        //extract file/video
        //extract files from req.files

        const video= req.files.videoFile;

        //validation

        if(!sectionId || !title || !timeDuration || !description){
            return res.status(400).json({
                success:false,
                message:"All fields"
            })
        }
        //uploadvideotocloudinary
        const uploadDetails = await uploadFileToCloudinary(video,process.env.FOLDER_NAME);
        //create a subSection
        const SubSectionDetails=await SubSection.create({
            title:title,
            timeDuration:timeDuration,
            description:description,
            videoUrl:uploadDetails.secure_url,
        })
        //update section with this subsection objectId

        const updatedSection = await Section.findByIdAndUpdate({_id:sectionId},
            {$push:{
                subSection:SubSectionDetails._id,
            }},
            {new:true}).populate("subSection");                             // ek baar is populate ko check kar lena
        //return response
        return res.status(200).json({
            success:true,
            message:"Sub Section Created Successfully",
            updatedSection,
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message :"Internal Server Error"

        })
    }
}

exports.updateSubSection=async(req,res)=>{
    try{
        //fetch data from req body
        const {subSectionId, title, timeDuration, description}=req.body;
        //extract file/video
        const video = req.files?.videoFile;

        //validation
        if(!subSectionId){
            return res.status(400).json({
                success:false,
                message:"SubSection id is required"
            })
        }

        //build update fields dynamically
        const updateFields = {};
        if(title){
            updateFields.title = title;
        }
        if(timeDuration){
            updateFields.timeDuration = timeDuration;
        }
        if(description){
            updateFields.description = description;
        }

        //if a new video is provided, upload it to cloudinary and update the videoUrl
        if(video){
            const uploadDetails = await uploadFileToCloudinary(video,process.env.FOLDER_NAME);
            updateFields.videoUrl = uploadDetails.secure_url;
        }

        //update the subSection
        const updatedSubSection = await SubSection.findByIdAndUpdate(
            {_id:subSectionId},
            {$set:updateFields},
            {new:true}
        );

        if(!updatedSubSection){
            return res.status(404).json({
                success:false,
                message:"SubSection not found"
            })
        }

        //return response
        return res.status(200).json({
            success:true,
            message:"Sub Section Updated Successfully",
            updatedSubSection,
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message :"Internal Server Error",
            error: error.message
        })
    }
}

exports.deleteSubSection=async(req,res)=>{
    try{
        //fetch data from req body
        const {subSectionId, sectionId}=req.body;

        //validation
        if(!subSectionId || !sectionId){
            return res.status(400).json({
                success:false,
                message:"SubSection id and Section id are required"
            })
        }

        //remove the subSection reference from the section
        const updatedSection = await Section.findByIdAndUpdate(
            {_id:sectionId},
            {$pull:{subSection:subSectionId}},
            {new:true}
        );

        if(!updatedSection){
            return res.status(404).json({
                success:false,
                message:"Section not found"
            })
        }

        //delete the subSection document
        const deletedSubSection = await SubSection.findByIdAndDelete(subSectionId);

        if(!deletedSubSection){
            return res.status(404).json({
                success:false,
                message:"SubSection not found"
            })
        }

        //return response
        return res.status(200).json({
            success:true,
            message:"Sub Section Deleted Successfully",
            deletedSubSection,
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message :"Internal Server Error",
            error: error.message
        })
    }
}

exports.getSubSectionDetails=async(req,res)=>{
    try{
        const {subSectionId}=req.body;
        if(!subSectionId){
            return res.status(400).json({
                success:false,
                message:"SubSection id is required",
            });
        }
        const subSectionDetails = await SubSection.findById(subSectionId);
        if(!subSectionDetails){
            return res.status(404).json({
                success:false,
                message:"SubSection not found",
            });
        }
        return res.status(200).json({
            success:true,
            message:"SubSection details fetched successfully",
            data:subSectionDetails,
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Cannot fetch subSection details",
            error:error.message,
        });
    }
}


