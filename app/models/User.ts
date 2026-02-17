// app\models\User.ts
import mongoose, { Document, Model, Schema } from "mongoose";

export interface Address {
    id: mongoose.Types.ObjectId
    label?: string
    fullName: string
    phone: string
    country: string
    city: string
    postalCode: string
    addressLine: string
}

export interface IUser extends Document {
    name: string
    email?: string
    passwordHash: string
    role: "user" | "admin"
    phone: string
    addresses: Address[]
    wishlist: mongoose.Types.ObjectId
    createdAt: Date
    updatedAt: Date

}

const AddressSchema = new Schema<Address>(
    {
        label: String,
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        country: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        addressLine: { type: String, required: true },
    }, { _id: true }

)

const UserSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, unique: true, index: true },
        passwordHash: { type: String, required: true },
        role: { type: String, enum: ['user', 'admin'], default: 'user' },
        phone: { type: String, required: true, unique: true, index: true },
        addresses: [AddressSchema],
        wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    },
    { timestamps: true }
)


export const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
