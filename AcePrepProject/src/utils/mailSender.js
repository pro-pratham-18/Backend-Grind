const nodemailer = require("nodemailer")

const mailsender = async (email,title,body)=>{
    try{
        //transporter configuration
        let transporter =  nodemailer.createTransport({
          host: process.env.MAIL_HOST,
          auth:{
            user :process.env.MAIL_USER,
            pass:process.env.MAIL_PASS,
          },
        })

        // sending the email

        let info = await transporter.sendMail({
            from:`AcePrep || StudyNotion-By Prathaemesh`,
            to:`${email}`,          // here you can see where the email will go , it will go to the email uploaded on the doc
            subject : `${title}`,
            html:`${body}`,
        })
        console.log(info);
        return info;  
    }
    catch(error){ 
        console.log(error.message);
    }
}
moudle.exports= mailsender;


















// FileSchema.post("save",async function(doc){     // it will get called just after document creation in the database     // the doc here is the uploaded document
//   try{
//   console.log("Doc",doc);

//   // send mail 

  let info = await transporter.sendMail({
    from:`prathamesh`,
    to:doc.email,          // here you can see where the email will go , it will go to the email uploaded on the doc
    subject : "New File Uploaded On Cloudinary",
    html:`<h2> Hello There </h2> <p> File Uplaoded View Here: <a href="${doc.fileUrl}">${doc.fileUrl}</a></p>`,
  })

  console.log("Info",info);
//   }
//   catch(err){ 
//     console.error();
//   }
// });