import mongoose from "mongoose";
import { MONGODB_URL } from "../../shared/constants/env";

console.log("MongoDB URL:", MONGODB_URL);

const connectToDatabase = async () => {
    try {
        await mongoose.connect(MONGODB_URL)
        console.log('Connected to database')
    } catch (error) {
        console.log('Error connecting to database', error)
        process.exit(1)
    }
}
export default connectToDatabase;