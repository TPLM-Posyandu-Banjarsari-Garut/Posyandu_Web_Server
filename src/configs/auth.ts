import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { bearer, emailOTP } from 'better-auth/plugins'
import { redisSecondaryStorage } from '@/configs/redis'
import * as schema from '@/db'
import db from '@/configs/db'
import env from '@/configs/env'
import { EmailService } from '@/services/email-service'

const trustedOrigins = [env.CORS_ORIGIN, ...env.TRUSTED_ORIGINS]
if (
    env.NODE_ENV === 'development' ||
    env.CORS_ORIGIN.includes('localhost') ||
    env.CORS_ORIGIN.includes('127.0.0.1')
) {
    trustedOrigins.push('http://localhost:3001')
}

export const auth = betterAuth({
    appName: 'Sampurasun Web Server',
    baseURL: env.BETTER_AUTH_URL,
    trustedOrigins: trustedOrigins,
    database: drizzleAdapter(db, {
        provider: 'pg',
        schema: {
            user: schema.users,
            session: schema.sessions,
            account: schema.accounts,
            verification: schema.verifications
        }
    }),
    secondaryStorage: redisSecondaryStorage,
    advanced: {
        defaultCookieAttributes: {
            sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
            secure: env.NODE_ENV === 'production',
            httpOnly: true,
            path: '/'
        }
    },
    plugins: [
        bearer(),
        emailOTP({
            sendVerificationOnSignUp: true,
            storeOTP: 'encrypted',
            overrideDefaultEmailVerification: true,
            async sendVerificationOTP({ email, otp, type }, request) {
                await EmailService.sendVerificationOTP(email, otp, type)
            }
        })
    ],
    emailAndPassword: {
        enabled: true,
        autoSignIn: false,
        requireEmailVerification: true,
        minPasswordLength: 12,
        maxPasswordLength: 128,
        sendResetPassword: async ({ user, url, token }, request) => {
            await EmailService.sendResetPasswordLink(user.email, url)
        }
    },
    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: false,
        sendOnSignIn: true,
        sendVerificationEmail: async ({ user }, request) => {
            await auth.api.sendVerificationOTP({
                body: {
                    email: user.email,
                    type: 'email-verification'
                }
            })
        }
    },
    socialProviders: {
        google: {
            prompt: 'select_account',
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET
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
        expiresIn: env.SESSION_EXPIRES_IN,
        updateAge: env.SESSION_UPDATE_AGE,
        cookieCache: {
            enabled: env.SESSION_COOKIE_CACHE_ENABLED,
            maxAge: env.SESSION_COOKIE_CACHE_MAX_AGE
        },
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
