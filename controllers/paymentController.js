import asyncWrapper from "../middlewares/asyncWrapper.js";
import { instance } from "../server.js";
import User from "../models/userModel.js";
import Payment from '../models/paymentModel.js'
import { createCustomError } from "../utils/errorClass.js";
import crypto from 'crypto'
import Razorpay from "razorpay";

export let buySubscription = asyncWrapper(async(req, res, next) => {
    let user = await User.findById(req.user._id)

    if(user.role === 'admin'){
        return next(createCustomError('Admin cannot buy subscription', 400))
    }

    let subscription = await instance.subscriptions.create({
        plan_id: process.env.PLAN_ID,
        customer_notify: 1,
        total_count: 12,
    })
    user.subscription.id = subscription.id
    user.subscription.status = subscription.status
    
    await user.save()

    res.json({
        success: true,
        subscription
    })
})

export let paymentVerification = asyncWrapper(async(req, res, next) => {
    let {razorpay_payment_id, razorpay_signature, razorpay_subscription_id} = req.body
    
    let user = await User.findById(req.user._id)

    let subscription_id = user.subscription.id

    let generated_signature = crypto
            .createHmac('SHA256', process.env.RAZORPAY_API_SECRET)
            .update(razorpay_payment_id + '|' + subscription_id)
            .digest('hex');

    if(generated_signature !== razorpay_signature){
        return res.redirect(`${process.env.FRONTEND_URL}/paymentfailed`)
    }

    await Payment.create({
        razorpay_payment_id,
        razorpay_signature,
        razorpay_subscription_id
    })
    user.subscription.status = 'active'

    await user.save()

    res.redirect(`${process.env.FRONTEND_URL}/paymentsuccess?reference=${razorpay_payment_id}`)
})

export let getRazorpayKey = asyncWrapper(async(req, res, next) => {
    res.json({
        success: true,
        key: process.env.RAZORPAY_API_KEY
    })
})


export let cancelSubscription = asyncWrapper(async(req, res, next) => {
    let user = await User.findById(req.user._id)

    let payment = await Payment.findOne({razorpay_subscription_id: user.subscription.id})

    let refundDays = process.env.REFUND_DAYS * 24 * 60 * 60 * 1000

    if(refundDays < (Date.now() - payment.createdAt)){
        return next(createCustomError('Cannot cancel subscription now', 400))
    }

    await instance.subscriptions.cancel(user.subscription.id)
    await instance.payments.refund(payment.razorpay_payment_id)

    await Payment.findOneAndDelete({razorpay_subscription_id: user.subscription.id})
    user.subscription.id = null
    user.subscription.status = null
    await user.save()

    res.json({
        success: true,
        message: 'Subsription cancelled. You will receive your refund shortly.'
    })
})