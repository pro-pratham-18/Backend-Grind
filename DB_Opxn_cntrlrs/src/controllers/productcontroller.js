// business logic

const productModel = require('../models/productmodel');


const GetProducts = async (req,res)=>{
    try{
        const myProduct= await productModel.find();
        res.json({
            message :"Get Request Successful",
            product :myProduct
        })
    }
    catch(err){
        res.status(500).json({
            message:"Intenal Servver Error"
        })
    }
}

const CreateProducts = async(req,res)=>{
    try{
        const {name,price,description,category}=req.body;
        const product = await productModel.create({name,price,description,category});
        res.status(200).json({
            message :"data has been created sucessfully",
            data :product
        })
    }
    catch(err){
        res.status(500).json({
            message : "Internal Server Error"
        })
    }
}


const DeleteProducts = async (req,res)=>{
    try{
        const {id}= req.params;
        const product = await productModel.findByIdAndDelete(id);
        if(!product){
            return res.status(404).json({
                message:"Error 404 Not Found"
            })
        }
        res.status(200).json({
                message :"The Following Documnet has been deleted successfully",
                data :product
            });
    }
    catch(err){
        res.status(500).json({
            message :"Internal Server Error"
        });
    }
}

const UpdateProduct = async (req,res)=>{
    try{
    const {id} = req.params;
    const {name,price} = req.body
    const product = await productModel.findByIdAndUpdate(id,{name,price},{returnDocument:"after"});
    if(!product){
        return res.json({
            message:"Error 404 Not found"
        })
    }
    res.json({
        message :"Updation Successful",
        NewProduct:product
    })
    }
    catch(err){
        res.status(500).json({
            message:"Internal Server Error"
        })
    }
}

module.exports={GetProducts,CreateProducts,DeleteProducts,UpdateProduct}  // function ko export krne ka tarreka
