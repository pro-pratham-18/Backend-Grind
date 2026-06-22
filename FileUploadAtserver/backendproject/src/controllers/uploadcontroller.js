

// const bcrypt  =require("bcrypt");
// const authmodel = require("../models/filemodel");
// const jwt = require("jsonwebtoken");


// require('dotenv').config();


// handler function for local file upload 

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
        console.error(err);
    }
}



