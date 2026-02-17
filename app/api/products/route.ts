// app/api/products/route.ts
import { connectDB } from '@/app/models/lib/db'
import { Product } from '@/app/models/Product'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    try {
        await connectDB()

        const { searchParams } = new URL(request.url)

        // پارامترهای فیلتر و pagination
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const skip = (page - 1) * limit

        // فیلترهای کاتالوگ
        const category = searchParams.get('category')
        const animeTitle = searchParams.get('animeTitle')
        const style = searchParams.get('style')
        const size = searchParams.get('size')
        const printType = searchParams.get('printType')
        const frameColor = searchParams.get('frameColor')
        const minPrice = searchParams.get('minPrice')
        const maxPrice = searchParams.get('maxPrice')

        // مرتب‌سازی
        const sort = searchParams.get('sort') || 'newest'

        // ساخت query object
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const filter: any = { published: true }

        if (category) filter.categoryIds = { $in: [category] }
        if (animeTitle) filter.animeTitle = animeTitle
        if (style) filter.style = style

        // فیلتر قیمت
        if (minPrice || maxPrice) {
            filter['variants'] = {
                $elemMatch: {
                    ...(minPrice && { price: { $gte: parseInt(minPrice) } }),
                    ...(maxPrice && { price: { $lte: parseInt(maxPrice) } }),
                },
            }
        }

        // فیلتر variant خاص
        if (size || printType || frameColor) {
            filter['variants'] = {
                $elemMatch: {
                    ...(size && { size }),
                    ...(printType && { printType }),
                    ...(frameColor && { frameColor }),
                    stock: { $gt: 0 },
                },
            }
        }

        // مرتب‌سازی
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sortOptions: any = {
            newest: { createdAt: -1 },
            popular: { 'meta.salesCount': -1 },
            'price-low': { 'variants.0.price': 1 },
            'price-high': { 'variants.0.price': -1 },
        }

        // Aggregation pipeline برای بهینه‌سازی
        const pipeline = [
            { $match: filter },
            // اضافه کردن variant ارزان‌ترین
            {
                $addFields: {
                    cheapestVariant: {
                        $min: '$variants.price',
                    },
                },
            },
            // مرتب‌سازی
            { $sort: sortOptions[sort] || sortOptions.newest },
            // Pagination
            { $skip: skip },
            { $limit: limit },
            // Projection برای کاهش حجم داده
            {
                $project: {
                    title: 1,
                    slug: 1,
                    shortDescription: 1,
                    images: { $arrayElemAt: ['$images', 0] },
                    tags: 1,
                    animeTitle: 1,
                    style: 1,
                    isFeatured: 1,
                    isNew: 1,
                    isOnSale: 1,
                    cheapestVariant: 1,
                    badges: {
                        $cond: {
                            if: { $or: [{ $eq: ['$isNew', true] }, { $eq: ['$isOnSale', true] }] },
                            then: {
                                $concatArrays: [
                                    { $cond: [{ $eq: ['$isNew', true] }, ['new'], []] },
                                    { $cond: [{ $eq: ['$isOnSale', true] }, ['sale'], []] },
                                ],
                            },
                            else: [],
                        },
                    },
                },
            },
        ]

        const [products, total] = await Promise.all([
            Product.aggregate(pipeline),
            Product.countDocuments(filter),
        ])

        const hasMore = skip + products.length < total

        return NextResponse.json({
            items: products,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
                hasMore,
            },
        })
    } catch (error) {
        console.error('Products API Error:', error)
        return NextResponse.json(
            { error: 'خطا در بارگذاری محصولات' },
            { status: 500 }
        )
    }
}
