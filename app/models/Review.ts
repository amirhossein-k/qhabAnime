// models/Review.ts
import mongoose, { Schema, Model, Document } from 'mongoose'

export interface IReview extends Document {
    productId: mongoose.Types.ObjectId
    userId: mongoose.Types.ObjectId
    rating: number
    title?: string
    body?: string
    isApproved: boolean
    createdAt: Date
    updatedAt: Date
}

const ReviewSchema = new Schema<IReview>(
    {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        title: String,
        body: String,
        isApproved: { type: Boolean, default: false, index: true },
    },
    { timestamps: true }
)

export const Review: Model<IReview> =
    mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema)
