import mongoose from "mongoose";
// Import all models to register them with Mongoose
// filepath: /home/vikash/Desktop/Project_sih/backend/src/index.ts
import '../models/unified-application.models';
import '../models/user.models';
import '../models/beneficiaryProfile.models';
import '../models/auditLog.models';
import '../models/paymentTransaction.models';
const DB_NAME = process.env.DB_NAME || "nyay_sahayak";

export const connectDB = async (): Promise<void> => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`✅ MongoDB connected! DB Hosted on: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("❌ MONGODB connection error:", error);
        process.exit(1);
    }
};

export default connectDB;