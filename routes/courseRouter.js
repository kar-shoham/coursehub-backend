import express from 'express'
import { addLecture, createCourse, deleteCourse, deleteLecture, getAllCourses, getCourseLectures } from '../controllers/courseController.js'
import singleUpload from '../middlewares/singleUpload.js'
import {authenticate, adminAuth} from '../middlewares/auth.js'

let router = express.Router()

router.route('/courses').get(getAllCourses)
router.route('/createcourse').post(authenticate, adminAuth, singleUpload, createCourse)
router.route('/course/:id')
    .get(getCourseLectures)
    .post(authenticate, adminAuth, singleUpload, addLecture)
    .delete(authenticate, adminAuth, deleteCourse)

router.route('/lecture').delete(authenticate, adminAuth, deleteLecture)


export default router