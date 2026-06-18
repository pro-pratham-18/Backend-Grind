


const namemodel=require("../models/namemodel");

const createName = async (req,res)=>{
    try{
        const name =req.body;
        const newname = await namemodel.create(name);
        res.status(200).json({
            message :"the namedata  has been posted",
            data :newname,
        })
    }
    catch(err){
        res.status(500).json({
            message:"Internal Server Error "
        })
    }
}

module.exports={createName}
