import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import createHttpError, { isHttpError } from "http-errors";
import cors from "cors";
import dotenv from 'dotenv'
import connectDB from './db/conn';

import postRoutes from './routes/postRoutes'

// URI Configuration
dotenv.config()

// App Init
const app = express();

app.use(morgan("dev"));

app.use(cors(
    { 
    origin: "*", 
    methods: ["GET","POST"], 
    credentials: true 
    }
));

app.use(express.json());

app.get('/', (req: express.Request, res: express.Response) => {
    res.setHeader('Content-Type', 'text/html')
    res.end('<h1>Hello World</h1>')
})

/* Routes */
app.use("/api", postRoutes);

app.use((req, res, next) => {
    next(createHttpError(404, "Endpoint not found"));
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
    console.error(error);
    let errorMessage = "An unknown error occurred";
    let statusCode = 500;
    if (isHttpError(error)) {
        statusCode = error.status;
        errorMessage = error.message;
    }
    res.status(statusCode).json({ error: errorMessage });
});

const PORT = process.env.PORT || 5000;


// Connect to MongoDB
connectDB().then(()=>{
    app.listen(PORT, () => {
        console.log(`Server started on port ${PORT}`);
    });
}).catch(console.error)

export default app;