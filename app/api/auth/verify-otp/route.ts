// app/api/auth/verify-otp/route.ts
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { connectDB } from '@/app/models/lib/db'
import { Otp } from '@/app/models/Otp'
import { User } from '@/app/models/User'


const MAX_ATTEMPTS = 5

export async function POST(req: NextRequest) {
    await connectDB()
    const { phone, code } = await req.json()

    if (!phone || typeof phone !== 'string' || !code) {
        return NextResponse.json({ error: 'اطلاعات ناقص است' }, { status: 400 })
    }

    const normalizedPhone = normalizePhone(phone)
    const codeHash = hashOtp(code.toString())

    const otpRecord = await Otp.findOne({ phone: normalizedPhone, used: false })
    if (!otpRecord) {
        return NextResponse.json({ error: 'کد نامعتبر یا منقضی شده' }, { status: 400 })
    }

    if (otpRecord.expiresAt.getTime() < Date.now()) {
        return NextResponse.json({ error: 'کد منقضی شده است' }, { status: 400 })
    }

    if (otpRecord.attempts >= MAX_ATTEMPTS) {
        return NextResponse.json({ error: 'تعداد تلاش‌ها زیاد است' }, { status: 429 })
    }

    // مقایسه hash
    if (otpRecord.codeHash !== codeHash) {
        otpRecord.attempts += 1
        await otpRecord.save()
        return NextResponse.json({ error: 'کد اشتباه است' }, { status: 400 })
    }

    // موفق → OTP را مصرف کن
    otpRecord.used = true
    await otpRecord.save()

    // کاربر را پیدا کن / بساز
    let user = await User.findOne({ phone: normalizedPhone })
    if (!user) {
        user = await User.create({
            name: 'کاربر جدید',
            email: `${normalizedPhone}@placeholder.local`,
            passwordHash: '',
            role: 'user',
            phone: normalizedPhone,
            addresses: [],
            wishlist: [],
        })
    }

    // TODO: اینجا باید session / JWT ست کنی (مثلاً با next-auth یا cookie خودت) [web:180][web:183]

    return NextResponse.json({
        success: true,
        user: {
            id: user._id,
            phone: user.phone,
            name: user.name,
            role: user.role,
        },
    })
}

// همون helperهای قبلی:
function normalizePhone(phone: string) {
    let p = phone.trim()
    if (p.startsWith('0')) p = p.slice(1)
    if (!p.startsWith('+')) p = '+98' + p
    return p
}

function hashOtp(code: string) {
    return crypto.createHash('sha256').update(code).digest('hex')
}
