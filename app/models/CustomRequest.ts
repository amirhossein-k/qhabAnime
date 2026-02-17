// models/CustomRequest.ts
import mongoose, { Schema, Model, Document } from 'mongoose'

export interface ICustomRequest extends Document {
    userId: mongoose.Types.ObjectId
    imageUrl: string
    description?: string
    style?: string
    size: string
    printType: string
    frameColor?: string
    status:
    | 'pending'
    | 'in-review'
    | 'priced'
    | 'accepted'
    | 'rejected'
    estimatedPrice?: number
    createdAt: Date
    updatedAt: Date
}

const CustomRequestSchema = new Schema<ICustomRequest>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        imageUrl: { type: String, required: true },
        description: String,
        style: String,
        size: { type: String, required: true },
        printType: { type: String, required: true },
        frameColor: String,
        status: {
            type: String,
            enum: ['pending', 'in-review', 'priced', 'accepted', 'rejected'],
            default: 'pending',
            index: true,
        },
        estimatedPrice: Number,
    },
    { timestamps: true }
)

export const CustomRequest: Model<ICustomRequest> =
    mongoose.models.CustomRequest ||
    mongoose.model<ICustomRequest>('CustomRequest', CustomRequestSchema)
