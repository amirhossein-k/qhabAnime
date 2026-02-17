// models/Otp.ts
import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IOtp extends Document {
    phone: string
    codeHash: string
    expiresAt: Date
    attempts: number
    used: boolean
    createdAt: Date
}

const OtpSchema = new Schema<IOtp>(
    {
        phone: { type: String, required: true, index: true },
        codeHash: { type: String, required: true },
        expiresAt: { type: Date, required: true },
        attempts: { type: Number, default: 0 },
        used: { type: Boolean, default: false },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
)

export const Otp: Model<IOtp> =
    mongoose.models.Otp || mongoose.model<IOtp>('Otp', OtpSchema)
