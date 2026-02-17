// app/api/auth/send-otp/route.ts
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { connectDB } from '@/app/models/lib/db'
import { Otp } from '@/app/models/Otp'
import { User } from '@/app/models/User'

const OTP_TTL_MS = 2 * 60 * 1000 // 2 دقیقه
const MAX_PER_PHONE_PER_WINDOW = 5

export async function POST(req: NextRequest) {
    await connectDB()
    const { phone } = await req.json()

    // 1) ولیدیشن پایه
    if (!phone || typeof phone !== 'string') {
        return NextResponse.json({ error: 'شماره معتبر نیست' }, { status: 400 })
    }

    const normalizedPhone = normalizePhone(phone) // مثلاً +98...

    // TODO: rate limiting واقعی (مثلاً Redis / IP-based) [web:178]

    // 2) تولید OTP امن
    const code = generateOtpCode(6) // مثل 472918
    const codeHash = hashOtp(code)

    const expiresAt = new Date(Date.now() + OTP_TTL_MS)

    // 3) رکورد قبلی را invalidate کن
    await Otp.updateMany(
        { phone: normalizedPhone, used: false },
        { $set: { used: true } }
    )

    // 4) ذخیره OTP جدید
    await Otp.create({
        phone: normalizedPhone,
        codeHash,
        expiresAt,
        attempts: 0,
        used: false,
    })

    // 5) ارسال SMS (اینجا فقط لاگ می‌کنیم)
    console.log(`OTP for ${normalizedPhone}: ${code}`)

    // در محیط production اینجا باید call به سرویس SMS بزنی [web:175][web:178]

    // اگر کاربر وجود ندارد، می‌تونی اینجا یا هنگام verify بسازی
    const existingUser = await User.findOne({ phone: normalizedPhone })
    if (!existingUser) {
        await User.create({
            name: 'کاربر جدید',
            email: `${normalizedPhone}@placeholder.local`,
            passwordHash: '',
            role: 'user',
            phone: normalizedPhone,
            addresses: [],
            wishlist: [],
        })
    }

    return NextResponse.json({
        success: true,
        message: 'کد تأیید ارسال شد',
        phone: normalizedPhone,
        expiresInMs: OTP_TTL_MS,
    })
}

// Helpers
function normalizePhone(phone: string) {
    // اینجا ساده نگه می‌دارم؛ بسته به نیازت می‌تونی lib مثل libphonenumber-js بزنی
    let p = phone.trim()
    if (p.startsWith('0')) p = p.slice(1)
    if (!p.startsWith('+')) p = '+98' + p // فرض ایران
    return p
}

function generateOtpCode(length: number) {
    const max = 10 ** length
    const n = crypto.randomInt(0, max) // امن [web:178]
    return n.toString().padStart(length, '0')
}

function hashOtp(code: string) {
    return crypto.createHash('sha256').update(code).digest('hex')
}
