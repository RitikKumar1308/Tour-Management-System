const fs = require('fs')
const express = require('express');
const AppError = require('./utils/errorHandle');
const ErrorController = require('./controller/errorController');
const mongosanitize=require('express-mongo-sanitize');
const ratelimiter=require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');

const morgan = require('morgan');
const tourRouter = require('./router/tourRouter');
const userRouter = require('./router/userRouter');
const app= express();
app.use(helmet());
app.use(express.json());

if(process.env.NODE_ENV==='development'){
    app.use(morgan('dev'))
}
// app.use(morgan('dev'))
//for serving static files
app.use(express.static(`${__dirname}/public`))
app.use(mongosanitize());

const limiter=ratelimiter({
    max:50,
    windowMs:20*60*1000,
    message:"Too many requests  from this Ip please try again in an hour"
})

app.use('/api',limiter);
app.use(xss());
app.use(hpp({
    whitelist:['duration','ratingsQuantity','ratingsAverage','maxGroupSize','difficulty','price']
}))


app.use("/api/v1/tours",tourRouter);
app.use("/api/v1/users",userRouter);

// app.get('/api/v1/tours',getAllTours);
// app.post('/api/v1/tours/',createTour);
// app.get('/api/v1/tours/:id',getTourById)
// app.patch('/api/v1/tours/:id',updateTour)
// app.delete('/api/v1/tours/:id',deleteTour)         
app.all("*",(req,res,next)=>{
    
    // const err = new Error(`can't fint ${req.originalUrl} on the server`);
    // err.status='fails',
    // err.statuscode=404
    // next(err);
    next(new AppError(`can't find ${req.originalUrl} on server`, 404))

})   
app.use(ErrorController.Error)    
module.exports=app;