const cloudinary=require('cloudinary').v2


exports.uploadFileToCloudinary= async (file,folder,height,quality)=>{
    try{
    const options = {folder,resource_type:"auto"};      // in both places the f of folder must be smaller or we can write, const options = {folder:Folder};
    if(height){
        options.height= height;
    }
    if(quality){                                                             // for imageReducerUpload
        options.quality = quality;
        if(quality<100){                                         // it can be removed i just added that
            options.public_id=file.name+"(Compressed)";
        }
    }
    else{
        options.public_id=file.name;
    }
    return await cloudinary.uploader.upload(file.tempFilePath,options);     // the result object has the certain info about the uploaded file on cloudinary

    }
    catch(err){
        console.error(err);
    }
}
