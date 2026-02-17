// lib/auth.ts
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import type { NextAuthConfig, User } from 'next-auth'
import { connectDB } from './db'
import crypto from 'crypto'
import { Otp } from '../Otp'
import { User as UserModel } from '../User'

export const authConfig: NextAuthConfig = {
    providers: [
        Credentials({
            credentials: {
                phone: { label: 'شماره موبایل', type: 'tel' },
                code: { label: 'کد تأیید', type: 'text' },
                step: { label: 'مرحله', type: 'text' },
            },
            async authorize(credentials, req) {
                await connectDB()

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { phone, code, step } = credentials as any

                if (!phone || !step) {
                    throw new Error('شماره موبایل الزامی است')
                }

                const normalizedPhone = normalizePhone(phone)

                if (step === 'send') {
                    // مرحله 1: ارسال OTP - فقط phone برگردون
                    const otpCode = generateOtpCode(6)
                    const otpHash = hashOtp(otpCode)
                    const expiresAt = new Date(Date.now() + 2 * 60 * 1000)

                    await Otp.updateMany(
                        { phone: normalizedPhone, used: false },
                        { $set: { used: true } }
                    )

                    await Otp.create({
                        phone: normalizedPhone,
                        codeHash: otpHash,
                        expiresAt,
                        attempts: 0,
                    })

                    console.log(`🔥 OTP for ${normalizedPhone}: ${otpCode}`)

                    // ✅ فقط برای مرحله send - null برگردون تا signIn کامل نشه
                    return null
                }

                if (step === 'verify') {
                    if (!code) {
                        throw new Error('کد تأیید الزامی است')
                    }

                    const otpRecord = await Otp.findOne({
                        phone: normalizedPhone,
                        used: false,
                    })

                    if (!otpRecord || otpRecord.expiresAt.getTime() < Date.now()) {
                        throw new Error('کد نامعتبر یا منقضی شده')
                    }

                    const codeHash = hashOtp(code)
                    if (otpRecord.codeHash !== codeHash) {
                        otpRecord.attempts! += 1
                        await otpRecord.save()
                        throw new Error('کد اشتباه است')
                    }

                    let user = await UserModel.findOne({ phone: normalizedPhone })
                    if (!user) {
                        user = await UserModel.create({
                            name: 'کاربر جدید',
                            email: `${normalizedPhone}@app.local`,
                            passwordHash: '',
                            role: 'user',
                            phone: normalizedPhone,
                            addresses: [],
                            wishlist: [],
                        })
                    }

                    otpRecord.used = true
                    await otpRecord.save()

                    // ✅ NextAuth User type کامل
                    return {
                        id: user._id.toString(),
                        name: user.name,
                        email: user.email || `${normalizedPhone}@app.local`,
                        image: null,
                        phone: user.phone,
                        role: user.role,
                    } as User
                }

                return null
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            // Initial sign in
            if (user) {
                token.id = user.id
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                token.phone = (user as any).phone
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                token.role = (user as any).role
            }

            // Return previous token if the can, so the session won't be invalidated
            return token
        },
        async session({ session, token }) {
            session.user.id = token.id as string
            session.user.phone = token.phone as string
            session.user.role = token.role as 'user' | 'admin'
            return session
        },
    },
    pages: {
        signIn: '/auth/login',
    },
    session: {
        strategy: 'jwt',
    },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)

// Helpers
function normalizePhone(phone: string) {
    let p = phone.trim().replace(/\s+/g, '')
    if (p.startsWith('0')) p = p.slice(1)
    if (!p.startsWith('09')) p = '09' + p.slice(2)
    return '+98' + p.slice(2)
}

function generateOtpCode(length: number) {
    return crypto.randomInt(0, 10 ** length).toString().padStart(length, '0')
}

function hashOtp(code: string) {
    return crypto.createHash('sha256').update(code).digest('hex')
}
