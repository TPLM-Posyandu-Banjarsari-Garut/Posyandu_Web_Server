import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import * as schema from '@/db'
import db from '@/configs/db'

export const auth = betterAuth({
    appName: 'Sampurasun Web Server',
    database: drizzleAdapter(db, {
        provider: 'pg',
        schema: {
            user: schema.users,
            session: schema.sessions,
            account: schema.accounts,
            verification: schema.verifications
        }
    }),
    emailAndPassword: {
        enabled: true,
        autoSignIn: true
    },
    user: {
        fields: {
            id: 'public_id',
            emailVerified: 'email_verified',
            image: 'avatar_url'
        },
        additionalFields: {
            role: { type: 'string', defaultValue: 'parent' },
            status: { type: 'string', defaultValue: 'active' }
        }
    },
    session: {
        fields: {
            id: 'public_id',
            expiresAt: 'expires_at',
            userId: 'user_id',
            userAgent: 'user_agent',
            ipAddress: 'ip_address'
        }
    },
    account: {
        fields: {
            id: 'public_id',
            userId: 'user_id',
            accountId: 'account_id',
            providerId: 'provider_id',
            accessToken: 'access_token',
            refreshToken: 'refresh_token',
            idToken: 'id_token',
            accessTokenExpiresAt: 'access_token_expires_at',
            refreshTokenExpiresAt: 'refresh_token_expires_at'
        }
    },
    verification: {
        fields: {
            id: 'public_id',
            expiresAt: 'expires_at'
        }
    }
})
