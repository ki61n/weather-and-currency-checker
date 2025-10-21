import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import router from './routes/routes.js'
// import groq from 'groq-sdk'
dotenv.config();
const app = express();
app.use(express.json())

app.use(cors())
app.use('/api',router)
const port = process.env.PORT || process.env.port || 3000

// Use standard MONGO_URI env var (fallback to previous mon)
const mongoUri = process.env.MONGO_URI || process.env.mon;
if (!mongoUri) {
    console.warn('Warning: MONGO_URI (or mon) is not set. Mongoose will not connect.');
}



// database connection
if (mongoUri) {
    mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
            console.log("database connected successfully");
        })
        .catch((error) => {
            console.error('Failed to connect to MongoDB:', error);
        });
}

app.listen(port,()=>{
    console.log(`server running at port ${port}`);
    
})