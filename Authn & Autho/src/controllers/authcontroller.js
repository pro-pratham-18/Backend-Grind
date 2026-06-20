

const bcrypt  =require("bcrypt");
const authmodel = require("../models/authmodel");
const jwt = require("jsonwebtoken");

require('dotenv').config();

const Signup = async (req,res)=>{
    try{
        const {username,email,password,role}=req.body
        const existingUser = await authmodel.findOne({email})
        if(existingUser){
            return res.status(400).json({
                success:false,
                message:"The user with this email Id Already Exists ,Either Go to The Login Section,Or Try A Different Email Id ",
            })
        }
        
        // hashed password 

        let hashedpassword;
        try{
            hashedpassword = await bcrypt.hash(password,10);
        }
        catch(err){
            return res.status(500).json({
                message:"Error Occured in Bcrypt Hashing "
            })
        } 
        // creating the new user in the database

        const newuser = await authmodel.create({username,email,password:hashedpassword,role});

        return res.status(201).json({
            message :"Signup Successful , Go to The login Section",
        })  
    }
    catch(err){
        console.error(err);
        return res.status(500).json({
            message:"Couldnt Create the User , Please try Again Later"
        })
    }
}


const Login = async (req, res) => {
    try {
        // extrcting email and password from the request 
        const { email, password } = req.body;

        // vaalidation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please enter both email and password"
            });
        }

        // checking if user already exists
        const user = await authmodel.findOne({ email });

        // if user doenst exist
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials , Signup First"
            });
        }

        //if exists
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
            id: user._id,
            role: user.role,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "2h",
        });

        const userobj = user.toObject();   // Converting the mongoose document to the js object
        delete userobj.password;           // deleting the passwrd for security reasons
        userobj.token = token;   // adding token field to the userObj , though we dont send token to the frontend

        const options = {
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            httpOnly: true,
        };

        
        // below way is using the cookie (preferred)  , you can send using body ,  header as well. so there becomes 3 way 
        return res.cookie("token", token, options).status(200).json({
                success: true,
                // token, we dont send this token to frontend due to security reasons
                userobj,
                message: "User logged in successfully"
            });
        
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


module.exports={Signup,Login}


// payload me generally ham do cheeze dete hai , id {mongodbdocumnet ki jisme credentials(data) stored hai , aur role (jo ki authorization me protected route ka access dene ke liye kaam ayega) }
// do hi de aisa jaruri nahi hai requiremnet ke hisab se aur bhi de sakte hai 

// create, find , here spcific if wala error case likhne ki jarurat nahi padti 
// findOne , aur Id wale commands me specific if wala error likhna padta hai , kyuki varaible calue null bhi hosakti hai , ye woh case hai jab ham wrong Id dal dete hai aur doc nahi milta , isliye server side error bolte hai isko aur 404 status code use krte hai
// find , findone me object pass hota hai as a argument