import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import createHttpError, { isHttpError } from "http-errors";
import cors from "cors";
import dotenv from 'dotenv'

// URI Configuration
dotenv.config()

// App Init
const app = express();

app.use(morgan("dev"));

app.use(express.json());

app.use(cors({ origin: process.env.CLIENT_ENDPOINT, methods: "GET,POST,PUT,DELETE", credentials: true }));

app.get('/', (req: express.Request, res: express.Response) => {
    res.setHeader('Content-Type', 'text/html')
    res.end('<h1>Hello World</h1>')
})

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

export default app;