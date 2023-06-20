import asyncWrapper from "../middlewares/asyncWrapper.js";
import User from '../models/userModel.js';
import {createCustomError} from '../utils/errorClass.js';
import sendMail from "../utils/sendMail.js";
import sendToken from "../utils/sendToken.js";
import crypto from 'crypto'
import Course from '../models/courseModel.js'
import getDataUri from '../utils/dataUri.js'
import cloudinary from 'cloudinary'

export let register = asyncWrapper(async(req, res, next) => {
    let {name, email, password, } = req.body
    let file = req.file
    if(!name || !email || !password || !file){
        return next(createCustomError('Some of the fileds are missing', 400))
    }

    let user = await User.findOne({email})

    if(user){
        return next(createCustomError('Email id is already registered', 409))
    }
    let fileUri = getDataUri(file)    

    let avatar = await cloudinary.v2.uploader.upload(fileUri.content)
    user = new User({
        name,
        email,
        password,
        avatar: {
            public_id: avatar.public_id,
            url: avatar.secure_url
        }
    })

    await user.save()

    sendToken(res, user, 'User Registered Successfully', 201)
})

export let login = asyncWrapper(async(req, res, next) => {
    let {email, password} = req.body

    if(!email || !password){
        return next(createCustomError('Some of the fileds are missing', 400))
    }

    let user = await User.findOne({email}).select('+password')

    if(!user){
        return next(createCustomError('Invalid username or password', 400))
    }

    let isMatched = await user.comparePassword(password)

    if(!isMatched){
        return next(createCustomError('Invalid username or password', 400))
    }

    sendToken(res, user, 'Logged in successfully', 200)
})

export let logout = asyncWrapper(async(req, res, next) => {
    let options = {
        httpOnly: true,
        expires: new Date(Date.now()),
        secure: true,
        sameSite: 'none'
    }
    res.status(200).cookie('token', '', options).json({
        success: true,
        message: 'Logged out successfully'
    })
})

export let getUserDetails = asyncWrapper(async(req, res, next) => {
    let user = await User.findById(req.user._id)

    res.json({
        success: true,
        user
    })
})

export let changePassword = asyncWrapper(async(req, res, next) => {
    let {oldPassword, newPassword} = req.body

    if(!oldPassword || !newPassword){
        return next(createCustomError('Some of the fields are missing', 400))
    }

    if(oldPassword === newPassword){
        return next(createCustomError('Please give a unique password', 400))
    }

    let user = await User.findById(req.user._id).select('+password')

    let isMatched = await user.comparePassword(oldPassword)

    if(!isMatched){
        return next(createCustomError('Please enter correct old password', 400))
    }

    user.password = newPassword

    await user.save()

    res.status(200).json({
        success: true,
        message: 'Password Updated Successfully'
    })
})

export let updateProfile = asyncWrapper(async(req, res, next) => {
    let {name, email} = req.body

    if(!name && !email){
        return next(createCustomError('Nothing to update', 400))
    }

    let user = await User.findById(req.user._id)

    if(name) user.name = name

    if(email){

       let t = await User.findOne({email}) 
       if(user.email !== email && t) {
        return next(createCustomError('Email id is already in use', 409))
       }
       user.email = email
    }
    
    await user.save()

    res.status(200).json({
        success: true,
        message: 'Profile Updated Successfully'
    })
})

export let updateProfilePicture = asyncWrapper(async(req, res, next) => {
    let file = req.file
    let user = await User.findById(req.user._id)
    file = getDataUri(file)

    await cloudinary.v2.uploader.destroy(user.avatar.public_id)

    let myCloud = await cloudinary.v2.uploader.upload(file.content)

    user.avatar = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url
    }

    await user.save()
    res.json({
        success: true,
        message: 'Profile Picture updated successfully'
    })
})

export let forgotPassword = asyncWrapper(async(req, res, next) => {
    let {email} = req.body

    if(!email){
        return next(createCustomError('Please enter your email', 400))
    }

    let user = await User.findOne({email})

    if(!user){
        return next(createCustomError('Email is not registered', 401))
    }

    let token = user.getResetToken()
    await user.save()

    let url = `${process.env.FRONTEND_URL}/resetpassword/${token}`

    let message = `Hello ${user.name}, \nFollow the link below to update your password for coursehub\n ${url}`

    sendMail(message, email, "Reset password for Course HUB")

    res.status(200).json({
        success: true,
        message: `Reset password token send to your email: ${email}`
    })
})

export let resetPassword = asyncWrapper(async(req, res, next) => {
    let {token} = req.params

    let {newPassword} = req.body
    if(!token){
        return next(createCustomError('Invalid reset token ', 400))
    }
    if(!newPassword){
        return next(createCustomError('Please enter a new password', 400))
    }
    token = crypto.createHash('sha256').update(token).digest('hex')

    let user = await User.findOne({resetPasswordToken: token})

    if(!user || user.resetPasswordExpiry < Date.now()){
        return next(createCustomError('Token expired or invalid', 400))
    }

    user.password = newPassword
    user.resetPasswordToken = ""
    user.resetPasswordExpiry = ""
    await user.save()

    res.status(200).json({
        success: true,
        message: "Password Updated Successfully"
    })
})


export let addToPlaylist = asyncWrapper(async(req, res, next) => {
    let user = await User.findById(req.user._id)

    let course = await Course.findById(req.body.id)

    if(!course){
        return next(createCustomError('Invalid course id', 404))
    }

    let courseExists = user.playlist.find(ele => ele.course.equals(course._id))

    if(courseExists){
        return next(createCustomError('Course is already in the playlist', 409))
    }

    user.playlist.push({
        course: course._id,
        poster: course.poster.url
    })

    await user.save()
    
    res.json({
        success: true,
        message: 'Course added to playlist'
    })
})


export let removeFromPlaylist = asyncWrapper(async(req, res, next) => {
    let user = await User.findById(req.user._id)

    let course = await Course.findById(req.body.id)

    if(!course){
        return next(createCustomError('Invalid course id', 404))
    }

    let courseExists = user.playlist.find(ele => ele.course.equals(course._id))

    if(!courseExists){
        return next(createCustomError('Course is not in the playlist', 409))
    }

    user.playlist = user.playlist.filter(ele => !ele.course.equals(course._id))

    await user.save()
    
    res.json({
        success: true,
        message: 'Course removed from playlist'
    })
})

export let getAllUsers = asyncWrapper(async(req, res, next) => {
    let users = await User.find({})
    res.status(200).json({
        success: true,
        users,
        numOfUsers: users.length
    })
})

export let makeAdmin = asyncWrapper(async(req, res, next) => {
    let {id} = req.params
    let user = await User.findById(id)

    if(!user){
        return next(createCustomError('User not found', 404))
    }

    if(user.role === 'admin'){
        return next(createCustomError(`${user.name} is already an admin`, 400))
    }

    user.role = 'admin'
    await user.save()

    res.json({
        success: true,
        message: `${user.name} in now an admin`
    })
})


export let deleteUser = asyncWrapper(async(req, res, next) => {
    let user = await User.findById(req.params.id)

    if(!user){
        return next(createCustomError('User not found', 404))
    }

    if(user.role === 'admin'){
        return next(createCustomError('Cannot delete admin', 400))
    }

    await User.findByIdAndDelete(req.body.id)

    res.json({
        success: true,
        message: 'User deleted successfully'
    })
})

export let deleteMyProfile = asyncWrapper(async(req, res, next) => {
    await cloudinary.v2.uploader.destroy(req.user.avatar.public_id)
    await User.findByIdAndDelete(req.user._id)

    let options = {
        httpOnly: true,
        expires: new Date(Date.now()),
        secure: true,
        sameSite: 'none'
    }
    res.status(200).cookie('token', '', options).json({
        success: true,
        message: 'Your profile has been deleted successfully'
    })
})