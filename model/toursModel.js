const mongoose = require('mongoose');
const tourSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true," tour name is required"],
        unique:true    
    },
    price:{
        type:Number,
        required:[true,"price should be required"],
        min:[0,"price should be greater than 0"]
    },
    discountPrice:{
        type:Number,
    },
    rating:{
        type:String,
        default:4.1
    },
    ratingAverage:{
        type:Number,

    },
    ratingQuantity:{
        type:Number
    },
    coverImage:{
        type:String,
    },
    duration:{
        type:Number
    },
    maxGroupSize:{
        type:Number
    },
    images:[String],
    startDates:[Date],
    description:{
        type:String,
        required:[true,"description should be required"],
        trim:true
    },
    summary:{
        type:String,
        trim:true
    },
    difficulty:{
        type:String,
        required:[true,"difficulty should be required"]
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        
    },
});
const Tour =mongoose.model('Tour',tourSchema);
module.exports = Tour;


