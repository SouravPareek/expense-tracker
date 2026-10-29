import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';
import healthRouter from "./routes/health.routes.js";
import authRouter from './routes/auth.routes.js';
import categoryRouter from './routes/category.routes.js';

const app = express();

app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
}));

app.use(express.json());
app.use(cookieParser())


app.use("/api/health", healthRouter)
app.use("/api/auth", authRouter)
app.use("/api/categories", categoryRouter)




export default app