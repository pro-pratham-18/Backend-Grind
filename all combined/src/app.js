const express =require('express');
const cors = require('cors');

const noteModel = require("./models/note.model");
const app=express();

app.use(cors());
app.use(express.json());


// app.post('/notes',async (req,res)=>{
//     const data=req.body;
//     console.log("post request hit");
//         await noteModel.create({                   // variable assignment can also be used suppose(note) , then do note.save();
//             username:data.username,
//             email:data.email,
//             age:data.age

//     });
//     res.status(201).json({
//             message: "Note created successfully",
//             data:data
//         });
// });


app.get('/notes', async (req,res)=>{
    const notes =await noteModel.find();
    console.log("get request successful");
    res.status(200).json({
        message:"notes fetched successfully",
        notes :notes
    });
});

module.exports=app;