import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import authRoutes from './Routes/auth.route.js';
import userRoutes from './Routes/user.route.js';
import chatRoutes from './Routes/chat.route.js';
import { connectDB } from './Database/db.js';

dotenv.config();

const app = express();

// ---------- PORT ----------
const PORT = process.env.PORT || 4001;

// ---------- CORS ----------
const allowedOrigins = [
  "http://localhost:5173", // local frontend
  "https://your-vercel-frontend-url.vercel.app" // replace with your Vercel URL
];

app.use(cors({
  origin: function(origin, callback) {
    // allow requests like Postman or server-to-server (no origin)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `CORS error: The origin ${origin} is not allowed.`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true // allow cookies to be sent
}));

// ---------- MIDDLEWARE ----------
app.use(express.json());
app.use(cookieParser());

// ---------- ROUTES ----------
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

// ---------- DATABASE ----------
connectDB()
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.error("MongoDB connection error:", err));

// ---------- SERVER ----------
app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});

