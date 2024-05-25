import express, { urlencoded } from "express";
import cookieparser from "cookie-parser"
import dotenv from "dotenv"
import cors from 'cors'
import { connectDatabase } from "./db/db";
import userRouter from "./routes/user.Routes";
import { ErrorMiddleware } from "./middleware/Error";
import storeRouter from "./routes/store.Routes";
import ordersRouter from "./routes/order.Routes";
import paymentRouter from "./routes/payment.Routes";
import cloudinary from "cloudinary";
dotenv.config()


async function startServer() {
    const app = express();


app.use(express.json({
    limit:"90mb"
}));
app.use(cookieparser())
app.use(cors({
    origin: ['http://localhost:5173','http://localhost:5174','http://localhost:5175','https://schedule-message-6ed2c.web.app',"http://localhost:5173/profile"],
    credentials: true
}))
app.use(urlencoded({extended:true}))

// cloudinary
cloudinary.v2.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY ,
    api_secret:process.env.CLOUDINARY_SECRET
})

// routes
app.use("/api/v1",userRouter);
app.use("/api/v1",storeRouter);
app.use("/api/v1",ordersRouter);
app.use("/api/v1",paymentRouter);
    
app.get('/',(req,res)=>{
    res.status(200).json({
        msg: "Successfull"
    })
})
app.get("/api/v1/getkey",(req,res)=>{
    return res.status(200).json({
        key: process.env.RAZORPAY_API_KEY
    })
})

app.get("/api/v1/regularPlanId",(req,res)=>{
    return res.status(200).json({
        regularKey: process.env.REGULAR_PLAN_ID
    })
})

app.get("/api/v1/premiumPlanId",(req,res)=>{
    return res.status(200).json({
        premiumKey: process.env.PREMIUM_PLAN_ID
    })
})

app.get("/api/v1/plus",(req,res)=>{
    return res.status(200).json({
        plusKey: process.env.PLUS_PLAN_ID
    })
})

app.use(ErrorMiddleware);

app.listen(4000,()=> console.log("Server is listening to port 4000...."))

await connectDatabase()

}


startServer();


