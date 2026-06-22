

const filemodel = require("../models/filemodel");



// handler function for local file upload 

const cloudinary = require("cloudinary").v2;

exports.localFileUpload=async(req,res)=>{
    try {
        // fetch file
        const file  = req.files.file;                      // request se file nikalne ke liye     // the last "file" word represents the key of the file in the request
        console.log ("File Is Here..",file)

        let path = __dirname +"/files/"+`${file.name.split('.')[0]}`+`.${file.name.split('.')[1]}`     // creating the path in which want to store the incoming file , it is like (directory + folder + name + extension )
        console.log("Path-->",path);
        file.mv(path , (err)=>{         // moving the file to the path 
            console.log(err);
        });
        res.json({
            success:true,
            message :"File Uploaded Succesfully On The Server"
        });
    }
    catch(err){ 
        return res.json({
            message :"Internal Server Error Occured"
        })
    }
}

//optional function to check supported file format (validation)

// function checlFileSupport(type,supportedType){    // this function can be used to check the supported file format
//     return supportedType.includes(type);
// }

async function uploadFileToCLoudinary(file,folder,quality){
    try{
    const options = {folder,resource_type:"auto"};      // in both places the f of folder must be smaller or we can write, const options = {folder:Folder};
    if(quality){                                                             // for imageReducerUpload
        options.quality = quality;
        if(quality<100){
            options.public_id=file.name+"(Compressed)";
        }
    }
    else{
        options.public_id=file.name;
    }
    console.log(options);                                                    // we can do resource type as auto as pwe our requiremnet    
    console.log(file.tempFilePath);
    console.log("Uploading....");
    const result = await cloudinary.uploader.upload(file.tempFilePath,options);     // the result object has the certain info about the uploaded file on cloudinary
    return result;
    }
    catch(err){
        console.error(err);
        return res.status(500).json({
            success :"false",
            message:"Could Not Fetch From The Cloudinary"
        });
    }
}

//handler function for file upload on cloudinary

exports.imageUpload=async(req,res)=>{
    try {
        // fetching the from req body 
        const {name,tags,email}= req.body;
        console.log(name,tags,email); 

        // fetching the file from req.file
        const file = req.files.imageFile;
        console.log(file);

        //validation
        const SupporteTypes = ["jpg","jpeg","png"];
        const fileType = file.name.split('.')[1].toLowerCase();
        console.log("FileType :",fileType);
        if(!SupporteTypes.includes(fileType)){      // we can also create the function for the validation (see line 34)
            return res.status(400).json({
                success:false,
                message:"unsupported File Format"
              })
        }
        // if the file format is supported
        console.log("supporteds File Format");
        const response = await uploadFileToCLoudinary(file,"ProPratham18")          // response stores the value returned by this function {which is nothing but the result variable (which contains the info about the uploaded image)}
        console.log(response);
        // db me entry save karni hai 

 
        const fileData = await filemodel.create({
            name,
            tags,
            email,
            fileUrl : response.secure_url                                        // ref of the uploaded file getting stored on the DB
        });


        // response
        console.log("Uploaded to Cloudinary and Reference Posted To DB");
        return res.status(200).json({
            success:true,
            message:"The File Has Been Uploaded Successfully",
            data :fileData
        })
    
    }
    catch(err){ 
        res.status(400).json({
            success:false,
            message:"Something is wrong"
        })
    }
}


// handeler function for uploading the video


exports.videoUpload=async(req,res)=>{
    try {
        // fetching the from req body 
        const {name,tags,email}= req.body;
        console.log(name,tags,email); 

        // fetching the file from req.file
        const file = req.files.videoFile;
        console.log(file);

        //validation      for production prefer using better validation approches than these two below

        //file extenion support validation
        const SupporteTypes = ["mp4","mkv","mov"];
        const fileType = file.name.split('.')[1].toLowerCase();
        console.log("FileType :",fileType);
        if(!SupporteTypes.includes(fileType)){      // we can also create the function for the validation 
            return res.status(400).json({
                success:false,
                message:"unsupported File Format"
              })
        }

        //file size support validation
        if (file.size > 100000000) {                          
            return res.status(400).json({
                success: false,
                message: "File size exceeds 100 MB"
            });
        }

        // if the file format is supported
        console.log("supported File Format");

        const response = await uploadFileToCLoudinary(file,"ProPratham18")          // response stores the value returned by this function {which is nothing but the result variable (which contains the info about the uploaded image)}
        console.log(response);
        // db me entry save karni hai

 
        const fileData = await filemodel.create({
            name,
            tags,
            email,
            fileUrl : response.secure_url                              // ref of the uploaded file getting stored on the DB
        });

        // response
        console.log("Uploaded to Cloudinary and Reference Posted To DB");
        return res.status(200).json({
            success:true,
            message:"The File Has Been Uploaded Successfully",
            data :fileData
        })
    
    }
    catch(err){ 
        res.status(400).json({
            success:false,
            message:"Something is wrong"
        })
    }
}


// handler function for imageReducerUplaod , image ki quality provided quality ke hisab se kam hojaeygi 
exports.imageReducerUpload=async(req,res)=>{
    try {
        // fetching the from req body 
        const {name,tags,email}= req.body;
        console.log(name,tags,email); 

        // fetching the file from req.file
        const file = req.files.imageFile;
        console.log(file);

        //validation
        const SupporteTypes = ["jpg","jpeg","png"];
        const fileType = file.name.split('.')[1].toLowerCase();
        console.log("FileType :",fileType);
        if(!SupporteTypes.includes(fileType)){      // we can also create the function for the validation 
            return res.status(400).json({
                success:false,
                message:"unsupported File Format"
              })
        }
        // if the file format is supported
        console.log("supporteds File Format");
        const response = await uploadFileToCLoudinary(file,"ProPratham18",50)          // response stores the value returned by this function {which is nothing but the result variable (which contains the info about the uploaded image)}            //example taking qualtiy as 50
        console.log(response);                                                  
        // db me entry save karni hai 

 
        const fileData = await filemodel.create({
            name,
            tags,
            email,
            fileUrl : response.secure_url                  // ref of the uploaded file getting stored on the DB
        });


        // response
        console.log("Uploaded to Cloudinary and Reference Posted To DB");
        return res.status(200).json({
            success:true,
            message:"The File Has Been Uploaded Successfully",
            data :fileData
        })
    
    }
    catch(err){ 
        res.status(400).json({
            success:false,
            message:"Something is wrong"
        })
    }
}


// point 

// when the data request is coming from the react hook , then the req.body will store the text data(like username , email , role , etc.) while req.files will store uploaded files from the frontend.
// inside the req.body , the keys will be as per your registered name in react hook form , and values will be as per the input value you gave when filling the form.
//inside the req.files , the uploaded files will be stored as object having object name as registered on frontend , and that object will contain info like (name , tempfilename, mimtype,etc)

// point 
// db operations ke baad aaya mila hua object mongoose doc hota hai , uski properties access kr sakte hai (like obj.name, etc.) but directly change nahi kr sakte (like obj.name = name1) , change krne ke liye use js object me convert karna padega using to.Object() {like const res = response.toObject() ,now we can do res.name=name1}

 
//the better validation approach is using the mimtype property of the incoming uploaded file ,  aisa gpt bol raha hai

// here , ham uploaded file ko cloudinary me save karwa rahe hai , aur uska refernce DB me store karwa hai (secure_url).