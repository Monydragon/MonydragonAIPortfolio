import mongoose from 'mongoose';

// MONGODB_URI will be checked at runtime in connectDB() function
// This allows scripts to load .env.local before importing this module
const MONGODB_URI = process.env.MONGODB_URI || '';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB(): Promise<typeof mongoose> {
  // Re-check MONGODB_URI at runtime (in case it wasn't loaded at import time)
  const uri = process.env.MONGODB_URI || MONGODB_URI;
  
  if (!uri || uri.trim() === '') {
    throw new Error('MONGODB_URI is not set. Please check your .env.local file.');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;

