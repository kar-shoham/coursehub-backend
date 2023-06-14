let errorHandlerMiddleware = (err, req, res, next) => {
    err.message = err.message || 'Internal Server Error'
    err.statusCode = err.statusCode || 500

    if(err._message === 'User validation failed') err.message = 'Invalid email address'
    res.status(err.statusCode).json({
        success: false,
        message: err.message
    })
}


export default errorHandlerMiddleware