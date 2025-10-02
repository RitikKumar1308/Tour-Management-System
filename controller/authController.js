const catchAsync= require("../utils/catchAsync");
const usermodel = require("../model/userModel.js");
const appError = require('../utils/errorHandle.js');
const sendEmail=require('../utils/nodemailer.js');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const{promisify}=require('util');
const signingToken =id=>{
    return jwt.sign({id},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES_IN});

}
const createSendToken=((user,statuscode,res)=>{
    const token= signingToken(user._id);

    res.cookie("jwt",token,{
        httpOnly:true,
        expires:new Date(Date.now()+process.env.COOKIE_EXPIRES_IN*24*60*60*1000),
        secure:process.env.NODE_ENV==='production'?true:false
    })
    user.password=undefined;
    user.active=undefined;  
    return res.status(statuscode).send({
        status:"success",
        token:token,
        data:{
            user:user
        }
    })
})
exports.signup =catchAsync(async(req,res,next)=>{
    const User={
        name:req.body.name,
        email:req.body.email, 
        password:req.body.password,
        confirmPassword:req.body.confirmPassword    
    };
    const newUser =await usermodel.create(User);
    //  const token = signingToken(newUser._id);

    createSendToken(newUser,201,res);
})
exports.login =catchAsync(async(req,res,next)=>{
    const {email,password}=req.body;
    if(!email || !password){
        return next(new appError("please provide email and password",401));
    }
    const user = await usermodel.findOne({email:email}).select('+password');
    console.log("here is user",user);
    if(!user || (!await user.comparepassword(password,user.password))){
        return next(new appError("incorrect email or password",401));
    }

    const token=signingToken(user._id);
    return res.status(200).json({
        status:"success",
        token:token
    })
})
exports.protect = catchAsync(async(req,res,next)=>{
    if(!req.headers.authorization || !req.headers.authorization.startsWith("Bearer")){
        next(new appError("you are not Logged in! please log in to get access",401));
    }
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        token= req.headers.authorization.split(" ")[1];
        console.log("here is token",token);
        //verify token
       const decoded=await promisify( jwt.verify)(token,process.env.JWT_SECRET);
       console.log("here is decoded",decoded);
       if(!decoded){
        return next (new appError("the token is invalid or expired",401));
       }
       // check user is still exists
       const currentUser= await usermodel.findById(decoded.id);
       if(!currentUser){
        return next(new appError("the user belonging to this toek is no longer exists",401));
       }
        const freshUser=await currentUser.changedPasswordAfter(decoded.iat);
        console.log("here is fresh user",freshUser);    
        if(freshUser){
            return next(new appError("user recently changed password! please login again",401))
        }
        req.user=currentUser;
        next();

         console.log("here is decoded",decoded);
        //  const currentUser = await usermodel.findById(decoded.id);

    }
    
})

exports.restrictsTo =(...roles)=>{
    return (req,res,next)=>{
         if(!roles.includes(req.user.role)){
        return next( new appError("you don't have permission to delete the tour",403));
        }
        next();
    };
};

exports.forgetPassword=catchAsync(async(req,res,next)=>{
    console.log("hello i am here ");
    const user=await usermodel.findOne({email:req.body.email});
    if(!user){
        return next(new appError("there is no user with email address",404));
    }
    //generate the random reset token
    const resetToken= await user.createPasswordResetToken();
    await user.save({validateBeforeSave:false});
    const message = `${req.protocol}://${req.get('host')}/api/vi/users/resetpassword/${resetToken}`;
    const subject="your password reset token (valid for 10 min)";

    try{
        await sendEmail({
            email:user.email,
            subject:subject,
            message:message
        })
        return res.status(201).json({
            status:"sucess",
            message:"token send to email"
        })
    }catch(err){
        console.log("here is error",err);
        user.resetPasswordToken=undefined;
        user.resetTokenExpires=undefined;
        await user.save({validateBeforeSave:false});
        return next(new appError("there was an error sending the email, try again later!"),500);

    }

})
exports.resetPassword=catchAsync(async(req,res,next)=>{

    //1)get user based on the token
   const hashedToken =await  crypto.createHash('sha256').update(req.params.token).digest('hex');
   const user= await usermodel.findOne({resetPasswordToken:hashedToken});
   console.log("Date isss",Date.now());
    console.log("here is user",user.resetTokenExpires);
    if(user.resetTokenExpires<Date.now()){
        console.log("token has expired");
    }
   console
   if(!user){
    return next(new appError("token is invalid or has expired",400));
   }
   user.password=req.body.password;
    user.confirmPassword=req.body.confirmPassword;
    user.resetPasswordToken=undefined;
    user.resetTokenExpires=undefined;
    await user.save();
    //2)if token has not expired, and there is user,set the new password                
    const token=signingToken(user._id);
    return res.status(200).json({
        status:"success",
        token:token
    })
})
module.exports.updatePassword=catchAsync(async(req,res,next)=>{
    //1)get user from collection
    const user= await usermodel.findById(req.user.id).select('+password');
     if(!user){
        return next(new appError("the user is not found",404));
    } 
    if(!await user.comparepassword(req.body.currentpassword,user.password)){
        return next(new appError("your current password is wrong",401));
    }
    user.password=req.body.password;
    user.confirmPassword=req.body.confirmPassword;
    await user.save();  
    return res.status(200).json({
        status:"success",
        message:"password updated successfully"
    })
})
const allowedfields=(obj,...allowedfields)=>{
    const newobj={};
    Object.keys(obj).forEach(el=>{
        if(allowedfields.includes(el)){
            newobj[el]=obj[el];
        }

    })
    return newobj;
}
exports.updateMe=catchAsync(async(req,res,next)=>{
    
    //1)get user from collectionalloed
    if(req.body.password || req.body.confirmPassword){
        return next(new appError("this route is not for password update, please use /updatePassword",400))
    }
   const obj= allowedfields(req.body,'name','email');
    // console.log("here is obj",obj);
    const updatedUser= await usermodel.findByIdAndUpdate(req.user.id,obj,{new:true,runValidators:true});
    return res.status(200).json({       
        status:"success",       
        data:{user:updatedUser}
    })  
})
exports.deleteMe=catchAsync(async(req,res,next)=>{
    await usermodel.findByIdAndUpdate(req.user.id,{active:false});
    return res.status(204).json({
        status:"success",
        data:null  
    })             

})