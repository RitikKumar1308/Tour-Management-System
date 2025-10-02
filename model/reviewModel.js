const mongoose = require('mongoose');
const { create } = require('./userModel');
const reviewSchema = new mongoose.Schema({
    review:{
        type:String,
        trim:true,
        required:[true,"review can not be empty"]
    },
    rating:{
        type:Number,
        minlength:[1,"ratting should be above 1"],
        maxlength:[5,"ratting should be below 5"]
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:"User"
    },
    tour:{
        type:mongoose.Schema.ObjectId,
        ref:"Tour"  
    },
    createdAt:{
        type:Date,default:Date.now()
    },
},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}    
});

const  Review= mongoose.model("Review",reviewSchema);
module.exports=Review;