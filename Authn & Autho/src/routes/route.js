const express = require('express');
const router =express.Router();

const {Auth,IsStudent,IsAdmin}=require("../mvare/mvare");

const authmodel=require("../models/authmodel")

const {Signup,Login}=require('../controllers/authcontroller');
const { findById } = require('../models/authmodel');

router.post("/Signup",Signup);
router.post("/login",Login);

router.get("/Student",Auth,IsStudent,(req,res)=>{
    return res.status(200).json({
        success:true,
        message :"You Are a Authorized Student ",
    })
});

router.get("/Admin",Auth,IsAdmin,(req,res)=>{
    return res.status(200).json({
        success:true,
        message :"You Are a Authorized Admin "
    })
});
 
router.get("/getEmail",Auth, async(req,res)=>{           // tokem verification me jo decoded payload aaya hai , wo ham req.user me daal dete hai authorization middleware me role check karne ke liye (req.user.role)  , us payload me id bhi hogi(agar token creation ke time pe daali hogi toh ) ,
    try{
    const id = req.user.id;                              // ham function laga ke req.user is id ko nikal sakte hai aur is id ka use krke DB operations apne stored data pe perform kar sakte hai
    const data = await authmodel.findById(id);
    if(!data){
        return res.status(404).json({
            message :"Data Not Found"
        })
    }

    return res.status(200).json({
        success:true,
        message :"Email Id Fetched Sucessfully",
        email :data.email
    })
    }
    catch(err){
        console.error(err);
        return res.status(500).json({
            message:"Internal Server Error"
        })
    }
});




module.exports=router