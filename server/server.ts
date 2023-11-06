import connectDB from './db/conn';
import app from "./index";


// Port
const PORT = process.env.PORT || 5000;


// Connect to MongoDB
connectDB().then(()=>{
    app.listen(PORT, () => {
        console.log(`Server started on port ${PORT}`);
    });
}).catch(console.error)





