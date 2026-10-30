import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import healthRouter from "./routes/health.routes.js";
import authRouter from "./routes/auth.routes.js";
import categoryRouter from "./routes/category.routes.js";
import expenseRouter from "./routes/expense.routes.js";

const app = express();

app.use(
    cors({
        credentials: true,
        origin: process.env.CLIENT_URL,
    }),
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/expenses", expenseRouter)

app.use((req, res, next) => {
    return res.status(404).json({
        message: "Route not found",
    });
});

   app.use((err, req, res, next) => {
       console.error(err);

       if (res.headersSent) return next(err);

       if (err.type === 'entity.parse.failed') {
           return res.status(400).json({ message: 'Invalid JSON' });
       }
       if (err.status && err.status >= 400 && err.status < 500) {
           return res.status(err.status).json({ message: 'Bad request' });
       }
       return res.status(500).json({ message: 'Internal server error' });
   });

export default app;
