import express from 'express';
import connectDB from './db/conn';
import dotenv from 'dotenv'

// URI Configuration
dotenv.config()

// App Init
const app = express();

// Connect to MongoDB
connectDB();

app.get('/', (req: express.Request, res: express.Response) => {
    res.setHeader('Content-Type', 'text/html')
    res.end('<h1>Hello World</h1>')
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

