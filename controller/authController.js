const catchAsync= require("../utils/catchAsync");
const usermodel = require("../model/userModel.js");
const appError = require('../utils/errorHandle.js');
const jwt = require('jsonwebtoken');
const{promisify}=require('util');
const signingToken =id=>{
    return jwt.sign({id},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES_IN});

}
exports.signup =catchAsync(async(req,res,next)=>{
    const User={
        name:req.body.name,
        email:req.body.email, 
        password:req.body.password,
        confirmPassword:req.body.confirmPassword    
    };
    const newUser =await usermodel.create(User);
     const token = signingToken(newUser._id);

    return res.status(201).send({
        status:"success",
        data:{
            user:newUser,
           
        },
         token:token
    })
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
       if(!decoded){
        return next (new appError("the token is invalid or expired",401));
       }
       // check user is still exists
       const currentUser= await usermodel.findById(decoded.id);
       if(!currentUser){
        return next(new appError("the user belonging to this toek is no longer exists",401));
       }
        const freshUser=await currentUser.changedPasswordAfter(decoded.iat);
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
    const resetToken=user.createPasswordResetToken();
    await user.save({validateBeforeSave:false});
    //send it to user's email
    // const resetURL=`${req.protocol}://${req.get('host')}/api/v1/users/resetpassword/${resetToken}`;
    // const message=`forgot your password? submit a PATCH request with your new password and confirmPassword to : ${resetURL}.\n if you didn't forget your password, please ignore this email!`
})