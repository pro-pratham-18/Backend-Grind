// custom middle ware

const jwt = require("jsonwebtoken");

const Auth= (req,res,next)=>{
    try{
        // const token = req.body.token;
        // const token = req.cookie.token;    // to take out the token from the cookie, we must use cookie-parser here if extracting the token from the cookies                ther are bascially three ways to extarct token , from body , from cookie and from header
        const token = req.cookies?.token || req.body?.token || req.header("Authorization")?.replace("Bearer ","");
        cnsole.log("cookies",req.cookies.token);
        // console.log(req.headers);       // to get the info if you are sending the token using the authorization header
        if(!token){
            return res.status(401).json({
                success:false,
                message :"The Token Is Missing"
            })
        }
        // verify the token
        try{
            const decoded = jwt.verify(token,process.env.JWT_SECRET);        // the decode here is basically the payload which we gave earlier , also incudes the creating time and expiration time of the token
            console.log(decoded);
            req.user=decoded;
        }
        catch(err){
            console.log(err);
            return res.status(401).json({
                success:false,
                message:"token Expired"
            })
        }
        next();
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message :"Verification Of the token failed Due To Internal server Error"
        });
    }
}

const IsStudent = (req,res,next)=>{
    try{
        if(req.user.role!=="Student"){
            return res.status(401).json({
                success:false,
                message:"Only The Students Are Authorized To acces"
            })
        }
        next();  
    }
    catch(err){
        console.error(err);
        return res.status(500).json({
            success:false,
            message :"Couldnt Authorize"
        })
    }
}
const IsAdmin= (req,res,next)=>{
    try{
        if(req.user.role!=="Admin"){
            return res.status(401).json({
                success:false,
                message:"Only The Admins Are Authorized To acces"
            })
        }
        next();  
    }
    catch(err){
        console.error(err);
        return res.status(500).json({
            success:false,
            message :"Couldnt Authorize"
        })
    }
}

module.exports={Auth,IsStudent,IsAdmin}

// the data we send in the cookie , is not recieved on frontend (security reasons) , inside the jwt token there is teh payload, it is stored on the browser.
// browser sends the request automatically which contains the jwt token(if generated).
// backend accepts this request and verifies the token using the authentication middleware, on successful verification, the paylaod which we gave earlier is returned to the variable object(decoded) in the verification, the req.user gest set as decode by us.Now, the next authorization middlware checks the role using req.user, and gives the required response as per the request on the protected route...


// ways to send token to the frontend--->
//1) using the request body(req.body)              {used genearlly for the testing} {the token is generally stored in the local storage here , and manually sent to the backend on every request for the verification }
//2) using the cookies                             { most conmonly used in production} { the token is inside the cookie , the cookie gets stored in the cookie storage of the browser, not in the local storage, and automatically sent to the backend on every request for the verfication } 
//3) using the headers                             {there are apps who use it }{the token is generally stored in the local storage here , and manually sent on every request for the protected route}


// inside the cookie , there is jwt token 
