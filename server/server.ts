import express from 'express';
import connectDB from './db/conn';
import dotenv from 'dotenv'

// URI Configuration
dotenv.config()

// App Init
const app = express();

// Connect to MongoDB
connectDB();

