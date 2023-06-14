import asyncWrapper from "../middlewares/asyncWrapper.js";
import { createCustomError } from "../utils/errorClass.js";
import sendMail from "../utils/sendMail.js";

export let contactUs = asyncWrapper(async(req, res, next) => {
    let {name, email, message} = req.body

    if(!name || !email || !message){
        return next(createCustomError('Some of the fields are missing', 400))
    }

    let msg = `Hi, this is ${name}. My email id is ${email}\nMy Message: \n\n${message}`
    let subject = 'Contact us mail from Course Hub User'
    sendMail(msg, process.env.MY_MAIL, subject)

    res.json({
        success: true,
        message: 'Message sent successfully'
    })
})

export let requestCourse = asyncWrapper(async(req, res, next) => {
    let {name, email, details} = req.body

    if(!name || !email || !details){
        return next(createCustomError('Some of the fields are missing', 400))
    }

    let msg = `Hi, this is ${name}. My email id is ${email}\nMy Course Request: \n\n${details}`
    let subject = 'Course Request from Course Hub User'
    sendMail(msg, process.env.MY_MAIL, subject)

    res.json({
        success: true,
        message: 'Request sent successfully'
    })
})