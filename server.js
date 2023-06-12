import app from './app.js';
import dotenv from 'dotenv';
import connectDB from './config/connect.js';
import cloudinary from 'cloudinary'

dotenv.config({
    path: './config/config.env'
})



let start = async() => {
    let server = app.listen(process.env.PORT, () => {
        console.log(`Server started on port ${process.env.PORT}...`)
    })
    cloudinary.v2.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    })
    try {
        await connectDB(process.env.MONGO_URI)
        console.log('Connected to database..')
    } catch (error) {
        console.log(`Error: ${error}`)
        console.log('Exiting the server..')
        server.close(() => {
            process.exit(1)
        })
    }
}

start()