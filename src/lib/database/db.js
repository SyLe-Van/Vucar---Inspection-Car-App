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

    const mongoUrl = getMongoUrl();
    if (!mongoUrl) {
      throw new Error(
        "Please define the MONGODB_URI (or legacy MONGODB_URL) environment variable in your environment"
      );
    }

    cached.promise = mongoose.connect(mongoUrl, opts).then(mongoose => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
