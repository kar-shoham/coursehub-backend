import express from 'express'
import {authenticate, adminAuth, authPro} from '../middlewares/auth.js'
import { contactUs, requestCourse } from '../controllers/otherController.js'

let router = express.Router()

router.route('/contactus').post(contactUs)
router.route('/requestcourse').post(requestCourse)


export default router