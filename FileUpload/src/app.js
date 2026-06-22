const express = require('express');
const cors = require('cors');
const  fileUpload = require("express-fileupload")
const Upload = require("../src/routes/fileUpload")

// const router = require('./routes/route')
 
const app = express();

app.use(cors());
app.use(express.json()); // this is used to parse the cookies

app.use(fileUpload({                   // using the file uppload middleware to
    useTempFiles: true,
    tempFileDir: "/tmp/"
})); 

app.use('/api/v1/upload',Upload)        // mounting the router object for file uploads
// app.use(router);  // gpt bol raha hai router wale middleware ko last me hi rakhte hai
 

module.exports = app;













