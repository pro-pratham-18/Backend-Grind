//specific route handeler 

const express = require('express');
const router =express.Router();


const authMidlleware = function(req,res,next){

    console.log("this is the auth middleware");
    
    if(req.body){
        console.log("auth successful");
        next();
    }
    else{
        res.json({
            message:"authorization failed"
        })
    }
    
}




const isStudent =function(req,res,next){
    console.log("this is the student check middleware");

    if(req.body.role==="student"){
        console.log("student verification successful");
        next();
    }
    else{
        res.json({
            message:"student verifciation failed"
        });
    }
}



const isAdmin = function(req,res,next){
    console.log("this is the admin check middleware");

    if(req.body.role==="admin"){
        console.log("admin verification succesful");
        next();
    }
    else{
        res.json({
            message:"admin authentication failed"
        })
    }
}

router.get("/student",authMidlleware,isStudent, async (req,res)=>{
    res.json({
        message:"you are inside the student section"
    });
});

router.get("/admin",authMidlleware,isAdmin,(req,res)=>{
    res.json({
        message:"you are inside the admin section"
    });
});



module.exports=router


