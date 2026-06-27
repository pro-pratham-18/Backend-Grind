const mongoose =require("mongoose");
require("dotenv").config(); //this line imports dotenv and loads env  configuration as well

const dns = require("dns");                   //added these for the dns problem on my pc, that doesn't mean it is necessary
dns.setServers(["1.1.1.1", "8.8.8.8"]);       // this too ,


exports.connectDB= async()=>{
    await mongoose.connect(process.env.MONGODB_URI,{
        useNewUrlParser: true,
        useUnifiedTopology:true,
    })
    .then(()=>console.log("DB Connected Successfully"))
    .catch((error)=>{
        console.log("DB Connection Failed");
        console.error(error);
        process.exit(1);       //  used to stop the server immediately when the database connection fails , agar ye use nahi kiya toh db connection na hone ke baad bhi server start (app.listen) hojayega , request toh hit hojayengi par DB Operations perform nahi ho payenge kyuki DB Connection nahi ho paya .
    })
};





// the last word is the database name , if there is no database having name pikachu then it will get created in mongo db