


const commentmodel=require("../models/commentmodel");
const postmodel  = require("../models/postmodel");

const createComment = async (req,res)=>{
    try{
        const {post,user,body}=req.body;
        const newcomment = await commentmodel.create({post,user,body});
        const addcommtopost = await postmodel.findByIdAndUpdate(post,{$push :{comments: newcomment._id}},{returnDocument: "after"});

        if(!addcommtopost){
            return res.status(404).json({
                messaage :"Error 404 Not Found"
            })
        }
        res.status(200).json({
            Cmessage :"the comment  has been created ",
            PostMessage : "Comment id added to the post ",
            comment :newcomment,
            post : addcommtopost
        })
    }
    catch(err){
        res.status(500).json({
            message:"Internal Server Error "
        })
    }
}


const updateComment = async (req,res)=>{
    try{
    const {id}=req.params;
    const {body}=req.body
    const comment = await commentmodel.findByIdAndUpdate(id,{body},{returnDocument: "after"});
    if(!comment){
            return res.status(404).json({
                messaage :"Error 404 Not Found"
            })
    }
    res.status(200).json({
        message :"comment has been updated",
        comment :comment
    })
    }
    catch(err){
        res.status(500).json({
            message:"Internal Server Error "
        })
    }
}


const deletecomment = async (req,res)=>{
    try{
    const {id}=req.params;
    const comment = await commentmodel.findByIdAndDelete(id);
    if(!comment ){
        return res.status(404).json({
            messaage :"Error 404 Not Found"
        })
    }
    const delcommfrompost = await postmodel.findByIdAndUpdate(comment.post,{$pull :{comments: comment._id}},{returnDocument: "after"});
    if(!delcommfrompost ){
        return res.status(404).json({
            message :"Error 404 Not Found"
        })
    }
    res.status(200).json({
        Cmessage :"following comment has been deleted from the post",
        comment :comment,
        post :delcommfrompost
    })
    }
    catch(err){
        res.status(500).json({
            message:"Internal Server Error "
        })
    }
}


module.exports={createComment,updateComment,deletecomment}
