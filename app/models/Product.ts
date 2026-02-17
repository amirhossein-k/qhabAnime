// models/Product.ts
import mongoose, { Schema, Model, Document } from 'mongoose'

export interface ProductVariant {
    _id: mongoose.Types.ObjectId
    size: string
    printType: 'poster' | 'canvas' | 'framed'
    frameColor?: string
    sku?: string
    price: number
    compareAtPrice?: number //تخفیف
    stock: number // تعداد باقی مانده
    weight?: number // وزن برای محاسبه ارسال
}

export interface ProductMeta {
    views: number
    salesCount: number
    ratingAvg: number
    ratingCount: number
}

export interface IProduct extends Document {
    title: string
    slug: string
    description?: string // توضیح کامل
    shortDescription?: string // برای نمایش کارت ها 
    categoryIds: mongoose.Types.ObjectId[] // ارجاغ به category
    tags: string[]
    animeTitle?: string
    style?: string
    images: string[]
    isFeatured: boolean
    isNewProduct: boolean
    isOnSale: boolean
    variants: ProductVariant[]
    meta: ProductMeta
    published: boolean
    createdAt: Date
    updatedAt: Date
}

const ProductVariantSchema = new Schema<ProductVariant>(
    {
        size: { type: String, required: true },
        printType: {
            type: String,
            enum: ['poster', 'canvas', 'framed'],
            required: true,
        },
        frameColor: String,
        sku: String,
        price: { type: Number, required: true },
        compareAtPrice: Number,
        stock: { type: Number, required: true, default: 0 },
        weight: Number,
    },
    { _id: true }
)

const ProductMetaSchema = new Schema<ProductMeta>(
    {
        views: { type: Number, default: 0 },
        salesCount: { type: Number, default: 0 },
        ratingAvg: { type: Number, default: 0 },
        ratingCount: { type: Number, default: 0 },
    },
    { _id: false }
)

const ProductSchema = new Schema<IProduct>(
    {
        title: { type: String, required: true },
        slug: { type: String, required: true, unique: true, index: true },
        description: String,
        shortDescription: String,
        categoryIds: [{ type: Schema.Types.ObjectId, ref: 'Category', index: true }],
        tags: [{ type: String, index: true }],
        animeTitle: { type: String, index: true },
        style: { type: String, index: true },
        images: [{ type: String }],
        isFeatured: { type: Boolean, default: false },
        isNewProduct: { type: Boolean, default: false },
        isOnSale: { type: Boolean, default: false },
        variants: [ProductVariantSchema],
        meta: { type: ProductMetaSchema, default: {} },
        published: { type: Boolean, default: true, index: true },
    },
    { timestamps: true }
)

export const Product: Model<IProduct> =
    mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema)
