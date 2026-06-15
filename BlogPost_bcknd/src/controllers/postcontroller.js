



const postmodel  = require("../models/postmodel");
const commentmodel=require("../models/commentmodel");
const likemodel = require("../models/likemodel")


const createpost = async (req,res)=>{
    try{
        const {user,title,body}=req.body;
        const newpost = await postmodel.create({user,title,body});
        res.status(200).json({
            PostMessage : "post has been created ",
            post : newpost
        });
    }
    catch(err){
        res.status(500).json({
            message:"Internal Server Error "
        })
    }
}

const updatepost = async (req,res)=>{
    try{
    const {id}=req.params;
    const {title,body}=req.body
    const post = await postmodel.findByIdAndUpdate(id,{title,body},{returnDocument: "after"});
    if(!post){
            return res.status(404).json({
                messaage :"Error 404 Not Found"
            })
    }
    res.status(200).json({
        message :"post has been updated",
        post :post
    })
    }
    catch(err){
        res.status(500).json({
            message:"Internal Server Error "
        })
    }
}

const deletepost = async (req,res)=>{
    try{
    const {id}=req.params;
    const post = await postmodel.findByIdAndDelete(id);
    if(!post){
            return res.status(404).json({
                messaage :"Error 404 Not Found"
            })
    }
    for(const comm of post.comments){
        const delcom = await commentmodel.findByIdAndDelete(comm);
        if(!delcom){
            return res.status(404).json({
                messaage :"Error 404 comment not found"
            })
    }
    }
    for( like of post.likes){
        const delLike = await likemodel.findByIdAndDelete(like);
        if(!delLike){
            return res.status(404).json({
                message :"Error 404 not like not found"
            })
    }
    } 
    res.status(200).json({
        message :"following post has been deleted from the post section , their comments and likes are also deleted",
        post :post
        
    })
    }
    catch(err){
        res.status(500).json({
            message:"Internal Server Error "
        })
    }

}

module.exports={createpost,updatepost,deletepost}
