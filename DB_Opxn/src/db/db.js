const mongoose =require("mongoose");
const dotenv=require("dotenv");

//load env  confhuration 
dotenv.config();

const dns = require("dns");                   //added these for the dns problem on my pc, that deosnt mean it is necessary 
dns.setServers(["1.1.1.1", "8.8.8.8"]);       // this too ,


async function connectDB(){
    try{
        await mongoose.connect(process.env.MONGODB_URI,{    // pokemon(in connection string) is database name , if there is no database having name pikachu then it will get created in mongo db
            useNewUrlParser:true,
        });     
        console.log("connected to DB");
    }
    catch(error){
        console.error(error.message);
        process.exit(1);
    }
};

module.exports=connectDB;