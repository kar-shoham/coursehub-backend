import { createCustomError } from "../utils/errorClass.js";
import asyncWrapper from "./asyncWrapper.js";
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

export let authenticate = asyncWrapper(async(req, res, next) => {
    let {token} = req.cookies
    console.log(token)
    if(!token){
        return next(createCustomError('Please login to access this resource', 401))
    }

    let {id} = jwt.verify(token, process.env.JWT_SECRET)
    
    let user = await User.findById(id)

    if(!user){
        return next(createCustomError('Some error occured', 401))
    }

    req.user = user
    next()
})

export let adminAuth = (req, res, next) => {
    if(req.user.role !== 'admin') {
        return next(createCustomError(`${req.user.role} is not allowed to access this resource`, 403))
    }
    next()
}

export let authPro = (req, res, next) => {
    if(req.user.subscription.status !== 'active' && req.user.role !== 'admin'){
        return next(createCustomError('Please subscribe to Pro pack to access this', 403))
    }

    next()
}