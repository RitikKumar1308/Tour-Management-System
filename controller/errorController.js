
const appError = require("../../complete-node-bootcamp-7f81af0ddf1e5ffdbbeddd8404941d6fc01588fd/4-natours/after-section-09/utils/appError");
const AppError = require("../utils/errorHandle");
const developmentErrors=(err,res)=>{
    console.log("erraaa",err.name)
     return res.status(err.statuscode).json({
        status:err.status,
        message:err.message,
        EError:err,
        stack:err.stack,

        })
}
const productionErrors=(err,res)=>{ 
    console.log("here is the value",err.operational)
    if(err.operational){
         return res.status(err.statuscode).json({
        status:err.status,
        message:err.message
     })
    }
    else{
        return res.status(500).json({
            status:"error",
            message:"something went very wrong"
        })
    }

   
}
const handleIdError= (err)=>{
    const message="invalid "+ err.path +": "+ err.value;
    return new AppError(message,404);
}
const validationError=(err)=>{
  //  const errors=Object.values(err.errors).map(el=>el.message);
  const error =Object.values(err.errors).map(el=>el.message);
    const message="invalid input data. "+ error.join('. ');
    return new AppError(message,404);
}
handledublicacyError=(err)=>{
    // console.log("here is a key value",err.error.keyValue);
    console.log("here is a key value",err.keyValue);
    const message="dublicate field value entered"+ JSON.stringify(err.keyValue);
    return new AppError(message,400);

}
exports.Error =(err,req,res,next)=>{
    console.log("here is the value",err.operational)
    err.statuscode=err.statuscode || 500;

    if(process.env.NODE_ENV==='development'){
        console.log("in development");
        console.log(err);
         console.log("name",err.name);

       developmentErrors(err,res);

    }
    else if(process.env.NODE_ENV==="production"){
    console.log("here error code",err.code);
        if(err.name==="CastError"){
            err= handleIdError(err);
            console.log("valueffff",err);
        } 
        if(err.code===11000){
            err=handledublicacyError(err);
        } 
        if(err.name==="ValidationError"){
            err=validationError(err);
        }
        productionErrors(err,res);


    }
    
    // next();
}