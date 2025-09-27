const fs = require('fs');
const tourModel= require('./../../model/toursModel');



const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({path:"./config.env"})

const DB =process.env.DATABASE.replace("<PASSWORD>",process.env.DATABASE_PASSWORD);
mongoose.connect(DB,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    // useCreateIndex:true,
    // useFindAndModify:false
})
.then((con)=>{
    console.log("Db is connected Successfully");
    // console.log(con.connections);
})


const insertdata = async()=>{
    const readable=fs.createReadStream(`${__dirname}/tours-simple.json`,'utf-8');
    readable.on("data",async(chunk)=>{
        const data=JSON.parse(chunk);
        const all=await tourModel.create(data);
        console.log(all);
        process.exit();
    });
}
const deletedata=async()=>{
    console.log("deleting data....");
    await tourModel.deleteMany();
    console.log("data is deleted");
    process.exit();
}
console.log(process.argv);
if(process.argv[2]==="--deleteMany"){
    deletedata()
}
else{
    insertdata()
}
