const mongoose =require("mongoose");

const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);


async function connectDB(){
    await mongoose.connect("mongodb+srv://Prathamesh:6P1862005j123%409@backend-grind.baz0ibl.mongodb.net/pikachu");
    console.log("connected to DB");
};

module.exports=connectDB;
