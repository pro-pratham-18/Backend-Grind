const express = require('express');
const  Upload =express.Router();

const {localFileUpload}=require("../controllers/uploadcontroller")

// routes for file upload

Upload.post("/localFileUpload",localFileUpload)
module.exports= Upload;