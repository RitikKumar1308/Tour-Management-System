const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({path:"./config.env"})
process.on('uncaughtException',(err)=>{
    console.log("uncaught exception is ",err.name);
    console.log("uncaught exception message",err.message);
    process.exit(1);
})
const app = require('./app');

console.log("hello",app.get('env'));
// console.log(process.env);
//in terminal for set env $env:NODE_ENV="development"
//for checking in terminal $env:NODE_ENV
//for setting custom env variable $env:yt="hello"
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

 const server=app.listen(3000,()=>{
    console.log("Server is running at 3000 port")
})  

process.on('unhandledRejection',(err)=>{
    console.log("unhandle rejection is",err.name);
    console.log("unhandled rejecttion message",err.message);
    server.close(()=>{
        console.log("shutting down...");
        process.exit(1);
    })
})