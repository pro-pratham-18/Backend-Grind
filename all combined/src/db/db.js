const mongoose =require("mongoose");

const dns = require("dns");                   //added these for the problem on my pc, that deosnt mean it is necessary 
dns.setServers(["1.1.1.1", "8.8.8.8"]);       // this too ,


async function connectDB(){
    await mongoose.connect("mongodb+srv://*****@backend-grind.baz0ibl.mongodb.net/pokemon");     // pikachu is database name , if there is no database having name pikachu then it will get created in mongo db
    console.log("connected to DB");
};

module.exports=connectDB;
