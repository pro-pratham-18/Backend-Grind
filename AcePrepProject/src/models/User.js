const mongoose =require("mongoose");
const nodemailer = require("nodemailer")
const transporter = require("../config/transportEmail")
const UserSchema =new mongoose.Schema({                  // specifically agar sirf get request maaar rahe ho tabh bhi schema banana padega even though hum kuch post/update nahi kar rahe , empty schema bana sakte hai for get request.
    firstName:{
      type:String,
      required:true,
      trim:true
    },
    lastName:{
      type:String,
      required:true,
      trim:true
    },
    email:{
      type:String,
      required:true,
      trim:true
    },
    password:{
      type:String,
      required:true
    },
    accountType:{
      type:String,
      required:true,
      enum:["Student","Admin","Instructor"]
    },
    additionalDetails:{
      type:mongoose.Schema.Types.ObjectId,
      required : true,
      ref :"Profile"
    },
    courses:[
      {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course"
      }
    ],
    image :{
      type:String,
      required:true,

    },
    courseProgress:[{
      type:mongoose.Schema.Types.ObjectId,
      ref:"CourseProgress"
    }],
    createdAt:{
      type:Date,
      default:Date.now
    }
 });
 
//  {collection:"user"}                    // when particuar collection name is required

// way to send the email after the successful posting in the DB

// post middleware

FileSchema.post("save",async function(doc){     // it will get called just after document creation in the database     // the doc here is the uploaded document
  try{
  console.log("Doc",doc);

  // send mail 

  let info = await transporter.sendMail({
    from:`prathamesh`,
    to:doc.email,          // here you can see where the email will go , it will go to the email uploaded on the doc
    subject : "New File Uploaded On Cloudinary",
    html:`<h2> Hello There </h2> <p> File Uplaoded View Here: <a href="${doc.fileUrl}">${doc.fileUrl}</a></p>`,
  })

  console.log("Info",info);
  }
  catch(err){ 
    console.error();
  }
});



const userModel=mongoose.model("User",UserSchema);      // line 8: "note" shows that collection on which api requests will get performed , in creation of colection in mongoDB this changes to plural , means it becomes "notes"                                               
module.exports=userModel;  // line  : if fetching the data from a collection which already exists , then use singular and first letter capital in model name (best practice), model name is basically "notes" here 


//line 8: model name becomes collection name in a database after lowercasing all letters and making it plural.


//the pre post midddleware must be added betweeen the schema declaration and the model declaration

// to send the email , go to your google account , manage account , turn on 2 step verification , then go in app passwords , then type name of the app you want your app passwrod for , then create it , copy it and paste it in MAIL_PASS of .env .
// the email will come to the email uploaded on the DB from the Email which we put in .env