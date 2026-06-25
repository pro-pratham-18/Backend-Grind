const mongoose =require("mongoose");
 const FileSchema =new mongoose.Schema({                  // specifically agar sirf get request maaar rahe ho tabh bhi schema banana padega even though hum kuch post/update nahi kar rahe , empty schema bana sakte hai for get request.
    name:{
      type:String,
      required:true
    },
    fileUrl:{
      type:String,
    },
    tags:{
      type:String,
    },
    email:{
      type:String,
    },
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

// is mailsender configuration config me kar rakha hai dekho


 const filemodel=mongoose.model("Files",FileSchema);      // line 8: "note" shows that collection on which api requests will get performed , in creation of colection in mongoDB this changes to plural , means it becomes "notes"                                               
 module.exports=filemodel;  // line  : if fetching the data from a collection which already exists , then use singular and first letter capital in model name (best practice), model name is basically "notes" here 


 //line 8: model name becomes collection name in a database after lowercasing all letters and making it plural.

 