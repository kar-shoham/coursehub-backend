import express from 'express';
import cookieParser from 'cookie-parser'
import errorHandlerMiddleware from './middlewares/errorHandlerMiddleware.js';
import courseRouter from './routes/courseRouter.js'
import userRouter from './routes/userRouter.js'

let app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())

app.use('/api/v1', courseRouter)
app.use('/api/v1', userRouter)


app.use(errorHandlerMiddleware)
export default app