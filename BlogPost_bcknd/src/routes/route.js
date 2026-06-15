const express = require('express');
const router =express.Router();



const {createComment,updateComment,deletecomment}=require('../controllers/commentcontroller')
const {createLike,deletelike}=require('../controllers/likecontrolller')
const {createpost,updatepost,deletepost}=require('../controllers/postcontroller')

// comment routes 
router.post("/comments/post",createComment);
router.put("/comments/put/:id",updateComment);
router.delete("/comments/delete/:id",deletecomment);

//like routes 
router.post("/like/post",createLike);
router.delete("/like/delete/:id",deletelike);


//post routes 
router.post("/post/post",createpost);
router.put("/post/put/:id",updatepost);
router.delete("/post/delete/:id",deletepost);

module.exports=router