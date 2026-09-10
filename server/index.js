import express from 'express'
import {config} from 'dotenv'
import connectDB from './Configs/connectDB.js'
import cookieParser from 'cookie-parser'
import authRouter from './Routes/auth.route.js'
import cors from 'cors'
import userRouter from './Routes/user.route.js'
import assistantRouter from './Routes/assistant.route.js'

config()

const app = express()
app.use(express.json())
app.use(cookieParser())

const privateCors = cors({
    origin:["http://localhost:5173"],
    credentials: true
})

const publicCors = cors({
    origin: "*"
})

const port = process.env.PORT || 8000;


app.get("/", (req, res) => {
    return res.status(200).json({
        message: "success"
    })
})

app.use("/api/auth",privateCors, authRouter)
app.use("/api/user",privateCors,  userRouter)
app.use("/api/assistant",publicCors,  assistantRouter)

app.listen(port, () => {
    connectDB()
    console.log(`Server is Running on Port ${port}`)
})