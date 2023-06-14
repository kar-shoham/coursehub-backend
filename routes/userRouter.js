import express from 'express'
import { changePassword, getUserDetails, login, logout, register, updateProfile, forgotPassword, resetPassword, addToPlaylist, removeFromPlaylist, updateProfilePicture, getAllUsers, makeAdmin, deleteUser, deleteMyProfile } from '../controllers/userController.js';
import {adminAuth, authenticate} from '../middlewares/auth.js'
import singleUpload from '../middlewares/singleUpload.js'

let router = express.Router()

router.route('/register').post(singleUpload, register)
router.route('/login').post(login)
router.route('/logout').post(logout)
router.route('/me').get(authenticate, getUserDetails)
router.route('/changepassword').patch(authenticate, changePassword)
router.route('/updateprofile').patch(authenticate, updateProfile)
router.route('/forgotpassword').post(forgotPassword)
router.route('/resetpassword/:token').patch(resetPassword)
router.route('/addtoplaylist').post(authenticate, addToPlaylist)
router.route('/removefromplaylist').post(authenticate, removeFromPlaylist)
router.route('/updateprofilepicture').patch(authenticate, singleUpload, updateProfilePicture)
router.route('/admin/users').get(authenticate, adminAuth, getAllUsers)
router.route('/makeadmin/:id').patch(authenticate, adminAuth, makeAdmin)
router.route('/admin/deleteuser').delete(authenticate, adminAuth, deleteUser)
router.route('/deletemyprofile').delete(authenticate, deleteMyProfile)

export default router