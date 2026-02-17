// models/Order.ts
import mongoose, { Schema, Model, Document } from 'mongoose'

export interface OrderItem {
    productId: mongoose.Types.ObjectId
    variantId: mongoose.Types.ObjectId
    title: string
    size: string
    printType: string
    frameColor?: string
    quantity: number
    unitPrice: number
    totalPrice: number
}

export interface ShippingAddress {
    fullName: string
    phone: string
    country: string
    city: string
    postalCode: string
    addressLine: string
}

export interface IOrder extends Document {
    userId: mongoose.Types.ObjectId
    items: OrderItem[]
    status:
    | 'pending'
    | 'paid'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'canceled'
    paymentStatus: 'unpaid' | 'paid' | 'refunded'
    paymentMethod: 'online' | 'cod'
    shipment: {
        trackingCode?: string
        carrier?: string
        status?: string
    }
    shippingAddress: ShippingAddress
    subtotal: number
    shippingCost: number
    discount: number
    total: number
    createdAt: Date
    updatedAt: Date
}

const OrderItemSchema = new Schema<OrderItem>(
    {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        variantId: { type: Schema.Types.ObjectId, required: true },
        title: { type: String, required: true },
        size: { type: String, required: true },
        printType: { type: String, required: true },
        frameColor: String,
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
    },
    { _id: false }
)

const ShippingAddressSchema = new Schema<ShippingAddress>(
    {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        country: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        addressLine: { type: String, required: true },
    },
    { _id: false }
)

const OrderSchema = new Schema<IOrder>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        items: [OrderItemSchema],
        status: {
            type: String,
            enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'canceled'],
            default: 'pending',
            index: true,
        },
        paymentStatus: {
            type: String,
            enum: ['unpaid', 'paid', 'refunded'],
            default: 'unpaid',
        },
        paymentMethod: { type: String, enum: ['online', 'cod'], default: 'online' },
        shipment: {
            trackingCode: String,
            carrier: String,
            status: String,
        },
        shippingAddress: { type: ShippingAddressSchema, required: true },
        subtotal: { type: Number, required: true },
        shippingCost: { type: Number, required: true },
        discount: { type: Number, required: true, default: 0 },
        total: { type: Number, required: true },
    },
    { timestamps: true }
)

export const Order: Model<IOrder> =
    mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema)
