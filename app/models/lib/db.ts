// lib/db.ts

import mongoose, { Mongoose } from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI as string

if (!MONGODB_URI) {
    throw new Error("❌ MONGODB_URI is not defined")
}

interface GlobalMongoose {
    conn: Mongoose | null
    promise: Promise<Mongoose> | null
}

declare global {
    // eslint-disable-next-line no-var
    var _mongoose: GlobalMongoose | undefined
}

const cached: GlobalMongoose = global._mongoose ?? {
    conn: null,
    promise: null,
}

if (!global._mongoose) {
    global._mongoose = cached
}

export async function connectDB(): Promise<Mongoose> {
    if (cached.conn) {
        return cached.conn
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {
            bufferCommands: false,
            maxPoolSize: 10,              // تنظیم متناسب با ترافیک
            serverSelectionTimeoutMS: 5000,
        })
    }

    cached.conn = await cached.promise
    return cached.conn
}
