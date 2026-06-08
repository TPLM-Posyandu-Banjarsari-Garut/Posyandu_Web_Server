import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import * as schema from '@/db'
import db from '@/configs/db'
import env from '@/configs/env'

export const auth = betterAuth({
    appName: 'Sampurasun Web Server',
    baseURL: env.BETTER_AUTH_URL,
    trustedOrigins: [env.CORS_ORIGIN],
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
        autoSignIn: true,
        sendResetPassword: async ({ user, url, token }, request) => {
            // TODO: Implement actual email sending logic here
            console.log(`Password reset link for ${user.email}: ${url}`)
        }
    },
    user: {
        fields: {
            image: 'avatar_url',
            emailVerified: 'email_verified',
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        },
        additionalFields: {
            role: { type: 'string', defaultValue: 'parent' },
            status: { type: 'string', defaultValue: 'active' }
        }
    },
    session: {
        fields: {
            expiresAt: 'expires_at',
            ipAddress: 'ip_address',
            userAgent: 'user_agent',
            userId: 'user_id',
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    },
    account: {
        fields: {
            accountId: 'account_id',
            providerId: 'provider_id',
            userId: 'user_id',
            accessToken: 'access_token',
            refreshToken: 'refresh_token',
            idToken: 'id_token',
            accessTokenExpiresAt: 'access_token_expires_at',
            refreshTokenExpiresAt: 'refresh_token_expires_at',
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    },
    verification: {
        fields: {
            expiresAt: 'expires_at',
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }
})
