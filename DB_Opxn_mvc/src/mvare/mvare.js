// custom middle ware

function loggingmiddleware(req,res,next){
    console.log("This is the logging middleware");
    next();
}

module.exports={loggingmiddleware}