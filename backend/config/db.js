// config/db.js
import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://jkarthikeya2004:karthikeya@cluster0.jzygx2d.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
        console.log("DB Connected");
    } catch (error) {
        console.error("DB Connection Error: ", error);
    }
};