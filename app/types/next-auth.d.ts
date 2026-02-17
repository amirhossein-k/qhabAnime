// types/next-auth.d.ts - کامل شده
import { DefaultSession, DefaultJWT, AdapterUser } from 'next-auth'
import { Session, User } from 'next-auth'

declare module 'next-auth' {
    interface User {
        id: string
        phone: string
        role: 'user' | 'admin'
        name: string
    }

    interface Session {
        user: {
            id: string
            phone: string
            role: 'user' | 'admin'
            name: string
            email: string
            image: string | null
            emailVerified: Date | null // ✅ اضافه شد
        } & DefaultSession['user']
    }
}

declare module 'next-auth/jwt' {
    /** Returns `next-auth` session token */
    interface JWT {
        id: string
        phone: string
        role: 'user' | 'admin'
        name: string
        email: string | null
        picture: string | null
    }
}

// ✅ Override authorize return type
declare module 'next-auth/providers' {
    interface ClientSafeProvider {
        id: string
        name: string
        type: string
        signinUrl: string
        callbackUrl: string
        authorization: string
    }
}
