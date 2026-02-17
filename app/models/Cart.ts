// models/Cart.ts
import mongoose, { Schema, Model, Document } from 'mongoose'

export interface CartItem {
    productId: mongoose.Types.ObjectId
    variantId: mongoose.Types.ObjectId
    quantity: number
    priceAtAdd: number
}

export interface ICart extends Document {
    userId?: mongoose.Types.ObjectId | null
    sessionId?: string | null
    items: CartItem[]
    createdAt: Date
    updatedAt: Date
}

const CartItemSchema = new Schema<CartItem>(
    {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        variantId: { type: Schema.Types.ObjectId, required: true },
        quantity: { type: Number, required: true, default: 1 },
        priceAtAdd: { type: Number, required: true },
    },
    { _id: false }
)

const CartSchema = new Schema<ICart>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
        sessionId: { type: String, default: null, index: true },
        items: [CartItemSchema],
    },
    { timestamps: true }
)

export const Cart: Model<ICart> =
    mongoose.models.Cart || mongoose.model<ICart>('Cart', CartSchema)
