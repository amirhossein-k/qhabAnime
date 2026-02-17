
// 'use server'

// import { connectDB } from "@/app/models/lib/db"
// import { Product } from "@/app/models/Product"
// import { positive, z } from 'zod'

// const createProductSchema = z.object({
//     title: z.string().min(3),
//     slug: z.string().regex(/^[a-z0-9-]+$/),
//     price: z.coerce.number().positive()

// })

// export async function createPoduct(formData: FormData) {
//     const session = await auth()

//     if (!session || session.user.role !== 'admin') {
//         throw new Error('شما مجوز انجام این عملیات را ندارید')
//     }
//     await connectDB()

//     const parsed = createProductSchema.safeParse({
//         title: formData.get('title'),
//         slug: formData.get('slug'),
//         price: formData.get('price'),
//     })

//     if (!parsed.success) {
//         // می‌تونی errorها رو به UI برگردونی
//         throw new Error('اطلاعات واردشده معتبر نیست')
//     }
//     const { title, slug, price } = parsed.data

//     await Product.create({
//         title,
//         slug,
//         images: [],
//         variants: [
//             { size: 'A4', printType: 'poster', price, stock: 0 },
//         ],
//         categoryIds: [],
//         tags: [],
//         isFeatured: false,
//         isNew: true,
//         isOnSale: false,
//         published: false,
//     })
// }

