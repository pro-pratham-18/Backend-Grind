const User = require("../models/User");
const OTP = require("../models/otp")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");

const OtpGenerator = require("otp-generator");

// send  Otp

exports.sendOTP=async (req,res)=>{
    try{

    //fetch email from request ki body

    //check if user already exist

    const {email}=req.body;
    const checkUserPresent =await User.findOne({email});

    // if user already exist ,then return a response
    if(checkUserPresent){
        return res.status(409).json({
            success:false,
            message:"User Already Registered",
        })
    }

    //create the unique otp
    let otp;
    let result;

    do {
        otp = OtpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });

        result = await OTP.findOne({ otp: otp });
    } while (result);

    const payLoad={email,otp};

    //create an entry in DB

    const otpBody = await OTP.create(payLoad);
    console.log(otpBody)

    //return response successful

    return res.status(200).json({
        success:true,
        message :`OTP Sent Successfully `
    })
    }
    catch(err){
        console.error(err);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error , Couldn't Send The OTP"
        })
    }
}

exports.Signup=async (req,res)=>{
    try{
        //data fetch from the request ki body

    const {
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        accountType,
        contactNumber,
        otp
    }=req.body;

    //validate 
    if(!firstName  || !lastName || !email || !password || !confirmPassword || !contactNumber || !otp){           // accountType not written here as it will get stored with any one enum value
        return res.status(400).json({
            success :false,
            message :"Please Enter All The Details"
        })
    }

    //check if the passeord and the confirm password is matching or not 

    if(password !== confirmPassword){
        return res.status(400).json({
            success:false,
            message:"password and the confirm Password should be same"
        })

    }

    // check if user already exists or not 

    const existingUser = await User.findOne({email});
    if(existingUser){
        res.status(400).json({
            success:false,
            message:"User with this email ID already exists, use different Email ID , Or Go to The Login Section "
        })
    }

    //find most recent otp stored for the user

    const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);
    console.log(recentOtp);

    //validateOtp

    if(recentOtp.length==0){
        //otp not found 
        return res.status(400).json({
            success:false,
            message:"OTP Not Found"
        })
    }
    else if(otp!==recentOtp[0].otp){
        // invalid Otp
        return res.status(400).json({
            success:false,
            message :"All fields are required"
        })
    }

    //hash Password 
    const hashedpassword = await bcrypt.hash(password,10);

    //entry create in DB

    const profileDetails = await Profile.create({
        gender :null,
        dateOfBirth:null,
        about:null,
        contactNumber:null,
    });
    const user = await User.create({
        firstName,
        lastName,
        email,
        contactNumber,
        password:hashedpassword,
        accountType,
        additionalDetails:profileDetails._id,
        image:`https://api.dicebear.com/10.x/initials/svg?seed=${firstName}${lastName}`
    })
    //returning the response
    return res.status(200).json({
        success:true,
        message :"User Is Registered",
        user,
    })

    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success :false ,
            message :"Internal Server Error , Couldn't Signup"
        })
    }
}


exports.Login=async(req,res)=>{
    try{
        //get data from req.body
        const {email,password}=req.body;
        //validation data
        if(!email  || !password){
            return res.status(400).json({
                success:false,
                message :"all fields are required,please try again "
            });
        }
        //user check exist or not

        const user= await User.findOne({email}).populate("additionalDetails")
        if(!user){
            return res.json({
                success:false,
                message:"The User With This Email Does Not Exist , Please Sign Up First"
            })
        }
        //if exists
        // generate JWT , after password matching        
        // compare the entered password with password stored in the database 
        const isMatch = await bcrypt.compare(password, user.password);
        // if not matched
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }
        //if matched , create a jwt token and send the token inside the cookie to
        const payload = {
            email:user.email,
            id: user._id,
            accountType:  user.accountType,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "2h",
        });

        const userobj = user  .toObject();   // Converting the mongoose document to the js object
        delete userobj.password;           // deleting the password for security reasons

        const options = {
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            httpOnly: true,
        };

    
        // create cookie and send response

        return res.cookie("token", token, options).status(200).json({
                success: true,
                userobj,
                message: "User logged in successfully"
            });        

    }
    catch(error){
        console.error(error);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error , Couldn't Login"
        })
    }
}

 //flow of the code for changePassword function
    //get data from req body 
    // get oldPassword , newPassword , confirmNewPassword
    //validation
    //update pwd in DB
    //send mail-password updated 
    //return response


exports.changePassword = async (req, res) => {
    try {
        // Fetch data
        const { oldPassword, newPassword, confirmPassword } = req.body;

        // Get user id from JWT middleware
        const userId = req.user.id;

        // Check confirm password
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match",
            });
        }

        // Find user
        const user = await User.findById(userId);

        // Verify old password
        const isPasswordMatch = await bcrypt.compare(
            oldPassword,
            user.password
        );

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "Old password is incorrect",
            }); 
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await User.findByIdAndUpdate(
            userId,
            { password: hashedPassword },
            { new: true }
        );

        await mailSender(
            user.email,
            "Password Changed",
            "Your password has been changed successfully."
        );

        return res.status(200).json({
            success: true,
            message: "Password changed successfully",
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to change password",
        });
    }
};

