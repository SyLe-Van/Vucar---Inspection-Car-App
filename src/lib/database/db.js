import mongoose from "mongoose";
import { appConfig } from "@/config/app";

// Đọc biến môi trường động mỗi lần gọi
const getMongoUrl = () => appConfig.database.url;

let cached;
if (typeof window === "undefined") {
  cached = globalThis.mongoose;
}

if (!cached) {
  cached = globalThis.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
    };

    const MONGODB_URL = getMongoUrl();
    if (!MONGODB_URL) {
      throw new Error(
        "Please define the MONGODB_URL environment variable inside .env.local"
      );
    }

    cached.promise = mongoose.connect(MONGODB_URL, opts).then(mongoose => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
