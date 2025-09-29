class AppError extends Error{
    constructor(message,statuscode){
        super(message);
        this.statuscode=statuscode,
        this.status=`${statuscode}`.startsWith(4)?"fails":"error",
        this.operational=true,
        Error.captureStackTrace(this,this.constructor)
    }
}

module.exports =AppError