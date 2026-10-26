import express from 'express'
import cors from 'cors'
import healthRouter from "./routes/health.routes.js";

const app = express();

app.use(cors({
    credentials: true,
    origin: true
}));

app.use("/api/health", healthRouter)

app.use(express.json());


export default app