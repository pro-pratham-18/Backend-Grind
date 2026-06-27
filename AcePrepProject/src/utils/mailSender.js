const nodemailer = require("nodemailer")

require("dotenv").config();

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
            from:`AcePrep || StudyNotion-By Prathamesh`,
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
module.exports= mailsender;
