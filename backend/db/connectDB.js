import mongoose from "mongoose";

// export const connectDB = async () => {
//     try {
//         const conn = await mongoose.connect(process.env.MONGO_URI)
//         console.log(`MongoDB Connected: ${conn.connection.host}`)
//     } catch (error) {
//         console.log("Error connection to MongoDB: ", error.message)
//         process.exit(1)
//     }
// }

export const connectDB = async () => {
  try {
    // Connect to MongoDB without deprecated options
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected!");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1); // Exit the process if connection fails
  }
};

