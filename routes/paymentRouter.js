import express from 'express'
import { buySubscription, cancelSubscription, getRazorpayKey, paymentVerification } from '../controllers/paymentController.js'
import {authenticate} from '../middlewares/auth.js'

let router = express.Router()


router.route('/buysubscription').post(authenticate, buySubscription)
router.route('/paymentverification').post(authenticate, paymentVerification)
router.route('/cancelsubscription').delete(authenticate, cancelSubscription)
router.route('/razorpaykey').get(getRazorpayKey)

export default router