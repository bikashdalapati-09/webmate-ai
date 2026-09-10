import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log(`Database Connected Successfully 👌`)
    } catch (error) {
        console.log(`Problem in Database connection 🥲`)
        console.log(error)
    }
}

export default connectDB