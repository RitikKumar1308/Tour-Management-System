const mongoose = require('mongoose');
const validator =require('validator');
const crypto = require('crypto');
const bcrypt =require('bcrypt');  
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"user name is required"],
        trim:true,
        unique:true
    },
    photo:{
        type:String,
    },
    role:{
        type:String,
        enum:{
            values:["user","admin","lead-guide","guide"],
            message:"role is either: user,admin,lead-guide,guide",
        },
        default:"user"
    },
    email:{
        type:String,
        unique:true,
        validate:[validator.isEmail,"please provide a valid email"]
    },
    password:{
        type:String,
        required:true,
        minlength:[9,"password length should be greater than 8 characters"],
        select:false
    },
    confirmPassword:{
        type:String,
        required:true,
        validate:{
            //this will work on create and save only
            validator:function(val){
                this.password===val
            },
            message:"Passwrod and confirmPassword are not same."
        }
    },
    resetTokenExpires:{
        type:Date
    },
    resetPasswordToken:{
        type:String,
    },
    passwordChangedAt:{
        type:Date
    }   ,
    active:{
        type:Boolean,
        default:true,
        select:false    
    }
});

userSchema.pre('save',async function(next){
    if(!this.isModified("password")){
        return next();
    }
    this.confirmPassword=undefined;
    console.log("before hash",this.confirmPassword)
    this.password =await bcrypt.hash(this.password,12);
    next();
})
userSchema.pre('save',function(next){
    if(!this.isModified("password") || this.isNew){
        return next();
    }   
    this.passwordChangedAt=Date.now()-1000;
    next();
})
userSchema.pre('/^find/',function(next){
    this.find({ative:{$ne:true}})
})
userSchema.methods.comparepassword=async function(candidatePassword,userpassword){
    return await bcrypt.compare(candidatePassword,userpassword);
}
userSchema.methods.changedPasswordAfter=function(JWTTimestamp){
    if(this.passwordChangedAt){
        const changedTimestamp=this.passwordChangedAt.getTime()/1000;
        if(JWTTimestamp<changedTimestamp){
            return true;
        }
        return false;
    }
}
userSchema.methods.createPasswordResetToken=  async function(){
    const resetToken = await crypto.randomBytes(32).toString('hex');
    this.resetPasswordToken=crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetTokenExpires=Date.now()+10*60*1000;
    console.log({resetToken},this.resetPasswordToken);
    return resetToken;
}

const User = mongoose.model("User",userSchema);

module.exports=User;