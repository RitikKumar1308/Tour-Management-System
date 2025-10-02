const fs=require('fs'); 
const tourModel=require('../model/toursModel');
const appError = require('../utils/errorHandle');
const catchAsync = require('../utils/catchAsync');  
const { start } = require('repl');
class ApiFeatures{
    constructor(query,querystr){
        this.query=query,
        this.querystr=querystr
    }
    filter(){
        let queryobj={...this.querystr};
        const excludeFields=['limit','sort','page','fields'];
        excludeFields.forEach((el)=> {delete queryobj[el]});
        //advance filtering
        let querystr=JSON.stringify(queryobj);
        queryobj=JSON.parse(querystr.replace(/\b gte|gt|lte|lt \b/g,match=>`$${match}`));
        this.query=this.query.find(queryobj);
        return this;

    }
    sort(){
        if(this.querystr.sort){
            let sortBy=this.querystr.sort.split(",").join(" ");
             this.query.sort(sortBy);  
        }
        else{
            this.query.sort("-createdAt");
        }
        return this
    }
    fields(){
        if(this.querystr.fields){
            let fields=this.querystr.fields.split(",").join(" ");
            this.query.select(fields);
        }else{
            this.query.select("-__v -createdAt");
        }
        return this;
    }
    pages(){
           const page=this.querystr.page*1||1;
        const limit=this.querystr.limit*1 ||100;
        const skip=(page-1)*limit;
       
           this.query.skip(skip).limit(limit);
            return this;  

    }
}
// const catchAsync =fn=>{
//     return(req,res,next)=>{
//         fn(req,res,next).catch(next);
//     }
// }
exports. getAllTours= catchAsync (async(req,res,next)=>{
    
        //filtering
        // let queryobj={...req.query};
        // const excludeFields=['limit','sort','page','fields'];
        // excludeFields.forEach((el)=> {delete queryobj[el]});
        // //advance filtering
        // let querystr=JSON.stringify(queryobj);
        // queryobj=JSON.parse(querystr.replace(/\b gte|gt|lte|lt \b/g,match=>`$${match}`));


        // const features = new ApiFeatures(tourModel.find(),req.query).filter().sort().fields().pages();  
            // const tours=await features.query;
        const tours=await tourModel.find();
       
        // const query = tourModel.find(queryobj);
        //  //sorting
        // if(req.query.sort){
        //     let sortBy=req.query.sort.split(",").join(" ");
        //      query.sort(sortBy);  
        // }
        // else{
        //     query.sort("-createdAt");
        // }
        // //fields limiting
        // if(req.query.fields){
        //     let fields=req.query.fields.split(",").join(" ");
        //     query.select(fields);
        // }else{
        //     query.select("-__v -createdAt");
        // }

        // //pagination
     
        
        // const tours=await query;
        return res.status(200).json({status:"sucess",result:tours.length,data:{tours:tours}})

});
exports. createTour= catchAsync(async(req,res,next)=>{
    
         // const newTour =Object.assign({id:newId},req.body);
            // const newTour = new tourModel(req.body);
            // newTour.save().then(()=>{
            //     return res.status(201).json({status:"success",data:{tour:newTour}})
            // })
           const tour= await tourModel.create(req.body);
              return res.status(201).json({status:"success",data:{tour:tour}})

        
        
});
exports. getTourById=catchAsync( async(req,res,next)=>{
    console.log("here is id",req.params.id);
    
        const tour= await tourModel.findById({_id:req.params.id}).populate({
            path:'guides',
            select:"-__v -_id"
        })
        console.log("here is tour",tour);
        if(!tour){
            // return res.status(404).json({status:"fail",message:"Invalid Id"})
            return next(new appError("invalid _id",404))
        }
        return res.status(200).json({status:"sucess",data:{tour:tour}});
    
    

});
exports. updateTour= catchAsync(async(req,res,next)=>{
   
   // return res.status(200).json({status:"sucess",data:"<data is updated >"})
});
exports. deleteTour= catchAsync(async(req,res,next)=>{
        const tour= await tourModel.findByIdAndDelete(req.params.id);
        if(!tour){
            return next(new appError("invalid _id",404))
        }   
        return res.status(204).json({status:"sucess",data:null})
     
    //return res.status(204).json({status:"sucess",data:null})
});

exports.tourStats= catchAsync(async(req,res,next)=>{
    
        const stats = await tourModel.aggregate([
            { $match: { ratingsAverage: { $gte: 1 } } },
            {
                $group: {
                    _id:"$difficulty",
                    total:{$sum:1},
                    avgRating:{$avg:"$ratingsAverage"},
                    avgPrice:{$avg:"$price"},
                    minPrice:{$min:"$price"},
                    maxPrice:{$max:"$price"},
                    toursName:{$push:"$name"}

                }

            },
            {
                $match:{_id:{$ne:"easy"}}
            },
            {$addFields:{difficulty:"$_id"}},
            {
               $sort:{avgPrice:-1}
            }
        ])
        console.log(stats);
        return res.status(200).json({status:"success",data:{stats:stats}})

    
});

exports.monthlyPlan = catchAsync(async(req,res,next)=>{
    

        const year =req.params.year*1;
        console.log(year)
        const plan = await tourModel.aggregate([
            {$unwind:"$startDates"},
            {$match:{
                $and:[
                //    { $expr:{$gte:[new Date(`${year}-01-01`),"startDates"]}},
                //    { $expr:{ $lte:[new Date(`${year}-12-31`),"$startDates"]}}
                {startDates:{$gte:new Date(`${year}-01-01`)}},
                {startDates:{$lte:new Date(`${year}-12-31`)}}
                ]
            }},
           // {
        // $match: {
        //   startDates: {
        //     $gte: new Date(`${year}-01-01`),
        //     $lte: new Date(`${year}-12-31`)
        //   }
        // }
     // },
            {
                $group:{
                    _id:{$month:"$startDates"},
                    numsOfTourStarts:{$sum:1},
                    tours:{$push:{tourname:"$name",starts:"$startDates"}}
                  
                }
            },
           { $addFields:{month:"$_id"}},
           
        ])
        return res.status(200).json({status:"sucess",data:{plan:plan}})
    
});
