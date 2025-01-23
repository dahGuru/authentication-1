import express from "express";
import { connectDB } from "./db/connectDB.js";
import dotenv from 'dotenv'
import authRoutes from './routes/authRoute.js'
import cookieParser from "cookie-parser";
import cors from 'cors'
import morgan from 'morgan';
import helmet from 'helmet';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

app.use(express.json()); // allows us to parse incoming requests:req.body
app.use(cookieParser()); // allows us to parse incoming cookies

app.use("/api/auth", authRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Something went wrong! Please try again later.' });
});

app.use(morgan('dev'));  // For development logs
app.use(helmet()); // Adds security-related HTTP headers


app.get('/',(req,res)=>{
    res.send("API Working")
})



app.listen(PORT, () => {
    connectDB();
    console.log("Server is running on port:", PORT);
});
