const mongoose =require("mongoose");

const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);


async function connectDB(){
    await mongoose.connect("mongodb+srv://*****@backend-grind.baz0ibl.mongodb.net/pikachu");     // pikachu is database name , if there is no database having name pikachu then it will get created in mongo db
    console.log("connected to DB");
};

module.exports=connectDB;
