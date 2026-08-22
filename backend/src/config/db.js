import mongoose from "mongoose";
import { ENV } from "./env.js";

let cachedPromise = null;

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  if (!cachedPromise) {
    const opts = {
      bufferCommands: false,
    };
    cachedPromise = mongoose.connect(ENV.MONGODB_URI, opts).then((mongooseInstance) => {
      console.log(`✅ MongoDB Connected: ${mongooseInstance.connection.host}`);
      return mongooseInstance.connection;
    }).catch((err) => {
      cachedPromise = null;
      console.error(`❌ MongoDB Connection Error: ${err.message}`);
      throw err;
    });
  }

  return cachedPromise;
};
