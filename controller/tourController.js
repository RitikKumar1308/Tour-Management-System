const fs=require('fs'); 
const tourModel=require('../model/toursModel');
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
exports. getAllTours= async(req,res,next)=>{
    try{
        //filtering
        // let queryobj={...req.query};
        // const excludeFields=['limit','sort','page','fields'];
        // excludeFields.forEach((el)=> {delete queryobj[el]});
        // //advance filtering
        // let querystr=JSON.stringify(queryobj);
        // queryobj=JSON.parse(querystr.replace(/\b gte|gt|lte|lt \b/g,match=>`$${match}`));


        const features = new ApiFeatures(tourModel.find(),req.query).filter().sort().fields().pages();  
            const tours=await features.query;
        // const tours=await tourModel.find();
       
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

    }
    catch(err){
        return res.status(400).json({status:"fail",message:err.message})
    }
   

};
exports. createTour= async(req,res,next)=>{
    try{
         // const newTour =Object.assign({id:newId},req.body);
            // const newTour = new tourModel(req.body);
            // newTour.save().then(()=>{
            //     return res.status(201).json({status:"success",data:{tour:newTour}})
            // })
           const tour= await tourModel.create(req.body);
              return res.status(201).json({status:"success",data:{tour:tour}})

        }catch(err){
            return res.status(400).json({status:"fail",message:err})

        }
        
}
exports. getTourById=async(req,res,next)=>{
    try{
        const tour= await tourModel.findById(req.params.id);
        if(!tour){
            return res.status(404).json({status:"fail",message:"Invalid Id"})
        }
        return res.status(200).json({status:"sucess",data:{tour:tour}});
    }
    catch(err){
        return res.status(400).json({status:"fail",message:err.message})
    }
    

}
exports. updateTour=(req,res,next)=>{
   
   // return res.status(200).json({status:"sucess",data:"<data is updated >"})
}
exports. deleteTour=(req,res,next)=>{
     
    //return res.status(204).json({status:"sucess",data:null})
}

exports.tourStats=async (req,res,next)=>{
    try{
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

    }catch(err){
        return res.status(400).json({status:"fail",message:err.message})
    }
}

exports.monthlyPlan = async(req,res,next)=>{
    try{

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
    }
    catch(err){
        return res.status(400).json({status:"fail",message:err.message});
    }
}
