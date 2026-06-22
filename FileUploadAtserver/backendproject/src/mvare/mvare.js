// custom middle ware

const jwt = require("jsonwebtoken");

const Auth= (req,res,next)=>{
    try{
        
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message :"Verification Of the token failed Due To Internal server Error"
        });
    }
}


module.exports={Auth,IsStudent,IsAdmin}

