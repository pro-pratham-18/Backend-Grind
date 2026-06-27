const express = require('express');
const  Upload =express.Router();

const {localFileUpload}=require("../controllers/uploadcontroller")
const {imageUpload}=require("../controllers/uploadcontroller")
const {videoUpload}=require("../controllers/uploadcontroller")
const {imageReducerUpload}=require("../controllers/uploadcontroller")

// routes for file upload

Upload.post("/localFileUpload",localFileUpload)


Upload.post("/imageUpload",imageUpload);
Upload.post("/videoUpload",videoUpload);
Upload.post("/imageReducerUpload",imageReducerUpload);

module.exports= Upload;