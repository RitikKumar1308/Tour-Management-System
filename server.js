const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({path:"./config.env"})
const app = require('./app');

//for checking environment
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

app.listen(3000,()=>{
    console.log("Server is running at 3000 port")
})  