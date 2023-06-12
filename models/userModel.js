import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto'

let userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is compulsory']
    },
    email: {
        type: String,
        required: [true, 'Email is compulsory'],
        unique: true,
        validate: validator.isEmail
    },
    password: {
        type: String,
        required: [true, 'Password is compulsory'],
        select: false,
        minLength: [8, 'Passwrod must be longer']
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    subscription: {
        id: String,
        status: String
    },
    avatar: {
        public_id: {
            type: String,
            required: [true, 'Public id of the avatar is compulsory']
        },
        url: {
            type: String,
            required: [true, 'Url of the avatar is compulsory']
        }
    },
    playlist: [
        {
            course: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Course'
            },
            poster: String
        }
    ],
    resetPasswordToken: String,
    resetPasswordExpiry: Date
})

userSchema.pre('save', async function(next){
    if(!this.isModified('password')) {
        next()
    } 
    this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.getJWT = function(){
    return jwt.sign({id: this._id}, process.env.JWT_SECRET, {expiresIn: '15d'})
}

userSchema.methods.comparePassword = function(password){
    return bcrypt.compare(password, this.password)
}
userSchema.methods.getResetToken = function(){
    let token = crypto.randomBytes(20).toString('hex')
    this.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex')
    this.resetPasswordExpiry = Date.now() + 15 * 60 * 1000   
    return token
}

export default mongoose.model('User', userSchema)