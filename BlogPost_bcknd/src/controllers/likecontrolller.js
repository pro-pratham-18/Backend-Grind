



const postmodel  = require("../models/postmodel");
const likemodel = require("../models/likemodel")

const createLike = async (req,res)=>{
    try{
        const {post,user}=req.body;
        const newlike = await likemodel.create({post,user});
        const addliketopost = await postmodel.findByIdAndUpdate(post,{$push :{likes : newlike._id}},{returnDocument: "after"});

        if(!addliketopost){
            return res.status(404).json({
                messaage :"Error 404 Not Found"
            })
        }
        res.status(200).json({
            Lmessage :"the post  has been liked  ",
            PostMessage : "like id  added to the post ",
            newlike :newlike,
            post : addliketopost
        })
    }
    catch(err){
        res.status(500).json({
            message:"Internal Server Error "
        })
    }
}

const deletelike = async (req,res)=>{
    try{
    const {id}=req.params;
    const like = await likemodel.findByIdAndDelete(id);

    if(!like){
            return res.status(404).json({
                messaage :"Error 404 Not Found"
            })
    }
    const dellikefrompost = await postmodel.findByIdAndUpdate(like.post,{$pull :{likes: like._id}},{returnDocument: "after"});
    if(!dellikefrompost){
            return res.status(404).json({
                message :"Error 404 Not Found"
            })
    }
    res.status(200).json({
        Cmessage :"following like has been deleted from the post",
        like :like,
        post :dellikefrompost
    })
    }
    catch(err){
        res.status(500).json({
            message:"Internal Server Error "
        })
    }
}


module.exports={createLike,deletelike}