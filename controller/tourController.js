const fs=require('fs'); 
const tourModel=require('../model/toursModel');
exports. getAllTours= async(req,res,next)=>{
    try{
        //filtering
        let queryobj={...req.query};
        const excludeFields=['limit','sort','page','fields'];
        excludeFields.forEach((el)=> {delete queryobj[el]});
        //advance filtering
        let querystr=JSON.stringify(queryobj);
        queryobj=JSON.parse(querystr.replace(/\b gte|gt|lte|lt \b/g,match=>`$${match}`));

       
        const query = tourModel.find(queryobj);
         //sorting
        if(req.query.sort){
            let sortBy=req.query.sort.split(",").join(" ");
             query.sort(sortBy);  
        }
        else{
            query.sort("-createdAt");
        }
        //fields limiting
        if(req.query.fields){
            let fields=req.query.fields.split(",").join(" ");
            query.select(fields);
        }else{
            query.select("-__v -createdAt");
        }

        //pagination
        const page=req.query.page*1||1;
        const limit=req.query.limit*1 ||10;
        const skip=(page-1)*limit;
        const count =await tourModel.countDocuments();
        if(skip>=count){    
            return res.status(404).json({status:"fail",message:"This page does not exist"})
        }
        else{
            query.skip(skip).limit(limit);  
        }

        
        const tours=await query;
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
