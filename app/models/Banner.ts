// models/Banner.ts
import mongoose, { Schema, Model, Document } from 'mongoose'

export interface IBanner extends Document {
    title: string
    subtitle?: string
    image: string
    link?: string
    position: 'home-hero' | 'home-middle' | 'shop-top' | string
    isActive: boolean
    sortOrder: number
    createdAt: Date
    updatedAt: Date
}

const BannerSchema = new Schema<IBanner>(
    {
        title: { type: String, required: true },
        subtitle: String,
        image: { type: String, required: true },
        link: String,
        position: { type: String, required: true, index: true },
        isActive: { type: Boolean, default: true, index: true },
        sortOrder: { type: Number, default: 0 },
    },
    { timestamps: true }
)

export const Banner: Model<IBanner> =
    mongoose.models.Banner || mongoose.model<IBanner>('Banner', BannerSchema)
