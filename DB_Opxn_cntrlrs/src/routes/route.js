const express = require('express');
const router =express.Router();

const {GetProducts}=require('../controllers/productcontroller')
const {CreateProducts}=require('../controllers/productcontroller')
const {DeleteProducts}=require('../controllers/productcontroller')
const {UpdateProduct}=require('../controllers/productcontroller')


router.get("/products/get",GetProducts);
router.post("/products/post",CreateProducts);
router.delete("/products/delete/:id",DeleteProducts);
router.put("/products/put/:id",UpdateProduct);
module.exports=router