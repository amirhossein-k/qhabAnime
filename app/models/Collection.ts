// models/Collection.ts
import mongoose, { Schema, Model, Document } from 'mongoose'

export interface ICollection extends Document {
    title: string
    slug: string
    description?: string
    productIds: mongoose.Types.ObjectId[]
    image?: string
    isFeatured: boolean
    createdAt: Date
    updatedAt: Date
}

const CollectionSchema = new Schema<ICollection>(
    {
        title: { type: String, required: true },
        slug: { type: String, required: true, unique: true, index: true },
        description: String,
        productIds: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
        image: String,
        isFeatured: { type: Boolean, default: false, index: true },
    },
    { timestamps: true }
)

export const Collection: Model<ICollection> =
    mongoose.models.Collection ||
    mongoose.model<ICollection>('Collection', CollectionSchema)
