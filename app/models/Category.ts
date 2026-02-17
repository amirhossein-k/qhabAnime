
// models/Category.ts

import mongoose, { Model, Schema } from "mongoose"


export interface ICategory extends Document {
    name: string
    slug: string
    parentId?: mongoose.Types.ObjectId | null
    description?: string
    image?: string
    createdAt: Date
    updatedAt: Date
}


const CategorySchema = new Schema<ICategory>(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true, index: true },
        parentId: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
        description: String,

        image: String,

    },
    { timestamps: true }
)


export const Category: Model<ICategory> =
    mongoose.models.Category ||
    mongoose.model<ICategory>('Category', CategorySchema)
