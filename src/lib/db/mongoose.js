import mongoose from "mongoose";

const MONGO_URI= process.env.MONGO_URI;

if(!MONGO_URI) {
  throw new Error("MONGO_URI is missing from env variables");

}

const cached = globalThis.mongoooseCache ?? {
  connection: null,
  promise: null,
};

globalThis.mongoooseCache = cached;

export async function connectDB() {
  if(cached.connection) {
    return cached.connection;
  }
   if(!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
  }

  try {
    cached.connection = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
    
  }
  return cached.connection;
}
