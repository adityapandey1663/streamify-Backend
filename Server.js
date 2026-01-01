import express from 'express'
const app = express()
import dotenv from "dotenv"
dotenv.config()
import authRoutes from './Routes/auth.route.js'
import { connectDB } from './Database/db.js'
import cookieParser from 'cookie-parser'
import userRoutes from './Routes/user.route.js'
import chatRoutes from './Routes/chat.route.js'
import cors from 'cors';




const PORT = process.env.PORT
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true  // allow frontend to send cookies
}))
app.use(express.json())
app.use(cookieParser());                  

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/chat", chatRoutes)

app.listen(PORT, ()=>{
    console.log(`Server is running in PORT ${PORT}`);
    connectDB();
    
})