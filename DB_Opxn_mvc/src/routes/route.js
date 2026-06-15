const express = require('express');
const router =express.Router();

const {loggingmiddleware}=require('../mvare/mvare')

const {GetProducts,CreateProducts,UpdateProduct,DeleteProducts,getProductByid}=require('../controllers/productcontroller')


router.get("/products/get",loggingmiddleware,GetProducts);
router.post("/products/post",CreateProducts);
router.put("/products/put/:id",UpdateProduct);
router.delete("/products/delete/:id",DeleteProducts);
router.get("/products/get/:id",loggingmiddleware,getProductByid);

module.exports=router
