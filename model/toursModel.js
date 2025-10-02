const slugify = require('slugify');
const mongoose = require('mongoose');
const User= require('./userModel')
const tourSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true," tour name is required"],
        unique:true ,
        minlength:[6,"name should be greater than 6 characters"],
        maxlength:[40,"name should be less than 40 characters"],
        trim:true    
    },
    price:{
        type:Number,
        required:[true,"price should be required"],
        min:[0,"price should be greater than 0"]
    },
    discountPrice:{
        type:Number,
        validate:{
            validator:function(val){
                //this only points to current doc on new document creation      
                return val < this.price;
            }   ,
            message:"discount price({VALUE}) should be less than regular price"
        }
    },
    secretTour:{
        type:Boolean,
        default:false
    },
    rating:{
        type:Number,
        default:4.5
    },
    ratingsAverage:{
          type:Number,
          default:4.1

    },
    ratingsQuantity:{
         type:Number,
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
        required:[true,"difficulty should be required"],
        enum:{
            values:["easy","medium","difficult"],
            message:"difficulty should be easy,medium,difficult"
        }
    },
    startLocation:{
        type:{
            type:String,
            default:"Point",
            enum:["Point"],       
        },
        coordinates:[Number],
        address:String,
        description:String

    },
    guides:[{
        type:mongoose.Schema.ObjectId,
        ref:'User'
    }],
    locations:[
        {
            type:{
                type:String,
                default:"Point",
                enum:["Point"]

            },
            coordinates:[Number],
            address:String,
            description:String,
            day:Number
        }
    ],
    createdAt:{
        type:Date,
        default:Date.now(),
        
    },
},{ 
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});
//this will when only d
tourSchema.virtual('durationWeeks').get(function(){
    return this.duration/7;
})
//document middleware this .save() and .create() not upsdate
tourSchema.pre('save',function(next){
    console.log("will save document");
    next();
})
tourSchema.pre('save', async function(next){
    this.name=await slugify(this.name,{lower:true});
    // console.log("will save document");
    next();
})

//.....this is for embbeding

// tourSchema.pre('save',async function(next){
//     this.guides=await Promise.all(this.guides.map(async id=>await User.findById(id) ));
//     next();
// })
tourSchema.post('save',function(doc,next){
    console.log("docs middleware",doc);
    // const val=
  
    next();
})
//query middleware
tourSchema.pre(/^find/,function(next){
    this.find({secretTour:{$ne:true}})
    next();
})

// aggregation middleware
tourSchema.pre("aggregate",function(next){
    this.pipeline().unshift({$match:{$ne:true}})
    next();
})

const Tour =mongoose.model('Tour',tourSchema);
module.exports = Tour;


