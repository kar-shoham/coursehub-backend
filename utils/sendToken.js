let sendToken = async (res, user, message, statusCode) => {
    let token = await user.getJWT()
    let options = {
        httpOnly: true,
        expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
    } 
    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        message,
        user
    })
}


export default sendToken