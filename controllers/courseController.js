import asyncWrapper from '../middlewares/asyncWrapper.js'
import Course from '../models/courseModel.js'
import {createCustomError} from '../utils/errorClass.js'
import getDataUri from '../utils/dataUri.js'
import cloudinary from 'cloudinary'
import userModel from '../models/userModel.js'

export let getAllCourses = asyncWrapper(async(req, res, next) => {
    let {keyword, category} = req.query
    if(!keyword) keyword = ""
    if(!category) category = ""
    let courses = await Course.find({
        title: { 
            $regex: keyword, 
            $options: 'i' 
        },
        category: {
            $regex: category, 
            $options: 'i'
        }
    }).select('-lectures')
    res.status(200).json({
        success: true,
        courses,
        numOfCourses: courses.length
    })
})

export let createCourse = asyncWrapper(async(req, res, next) => {
    let {title, description, category, createdBy} = req.body
    let file = req.file
    if(!title || !description || !category || !createdBy || !file) {
        return next(createCustomError('Some of the fields are missing', 400))
    }
    let fileUri = getDataUri(file)

    let poster = await cloudinary.v2.uploader.upload(fileUri.content)

    let course = new Course({
        title,
        description,
        category,
        createdBy,
        poster: {
            public_id: poster.public_id,
            url: poster.secure_url
        }
    })
    await course.save()

    res.status(201).json({
        success: true,
        message: 'Course Successfully Created',
        course
    })
})

export let getCourseLectures = asyncWrapper(async(req, res, next) => {
    let {id} = req.params

    let course = await Course.findById(id)

    if(!course){
        return next(createCustomError('Course not found', 404))
    }

    course.views += 1

    await course.save()

    res.status(200).json({
        success: true,
        lectures: course.lectures
    })
})

export let addLecture = asyncWrapper(async(req ,res, next) => {
    let {id} = req.params
    let {title, description} = req.body

    let file = req.file

    if(!title || !description || !file) {
        return next(createCustomError('Some of the fields are missing', 400))
    }

    let course = await Course.findById(id)

    if(!course){
        return next(createCustomError('Course not found', 404))
    }

    let fileUri = getDataUri(file)

    let lecture = await cloudinary.v2.uploader.upload(fileUri.content, {resource_type: 'video'})

    course.lectures.push({
        title,
        description,
        video: {
            public_id: lecture.public_id,
            url: lecture.secure_url
        }
    })
    course.numOfVideos = course.lectures.length

    await course.save()

    res.status(200).json({
        success: true,
        message: 'Lecture added successfully'
    })
})


export let deleteCourse = asyncWrapper(async(req, res, next) => {
    let {id} = req.params

    let course = await Course.findById(id)

    if(!course){
        return next(createCourse('Course not found', 404))
    }

    await cloudinary.v2.uploader.destroy(course.poster.public_id)

    course.lectures.forEach(async(lecture) => {
        await cloudinary.v2.uploader.destroy(lecture.video.public_id, {resource_type: 'video'})
    })

    await Course.findByIdAndDelete(id)

    res.json({
        success: true,
        message: 'Course deleted successfully'
    })
})

export let deleteLecture = asyncWrapper(async(req, res, next) => {
    let {courseId, lectureId} = req.query
    if(!courseId || !lectureId){
        return next(createCustomError('Some of the fields are missing', 400))
    }

    let course = await Course.findById(courseId)

    if(!courseId){
        return next(createCustomError('Course not found', 404))
    }

    course.lectures = course.lectures.filter((lecture) => {
        if(lecture._id.equals(lectureId)){
            cloudinary.v2.uploader.destroy(lecture.video.public_id, {
                resource_type: 'video'
            })
        }
        else return true;
    })

    course.numOfVideos = course.lectures.length

    await course.save()

    res.json({
        success: true,
        message: 'Lecture deleted successfully'
    })
})