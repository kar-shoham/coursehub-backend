import express from 'express';
import cookieParser from 'cookie-parser'
import errorHandlerMiddleware from './middlewares/errorHandlerMiddleware.js';
import courseRouter from './routes/courseRouter.js'
import userRouter from './routes/userRouter.js'
import paymentRouter from './routes/paymentRouter.js'
import otherRouter from './routes/otherRouter.js'

let app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())

app.use('/api/v1', courseRouter)
app.use('/api/v1', userRouter)
app.use('/api/v1', paymentRouter)
app.use('/api/v1', otherRouter)

app.use(errorHandlerMiddleware)
export default app


app.get('/', (req, res) => {
    res.send(`<h1>Backend is working, <a href=${process.env.FRONTEND_URL}>click here</a> to visit frontend</h1>`)
})