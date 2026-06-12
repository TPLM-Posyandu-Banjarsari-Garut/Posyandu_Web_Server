import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { bearer, emailOTP } from 'better-auth/plugins'
import * as schema from '@/db'
import db from '@/configs/db'
import env from '@/configs/env'
import { EmailService } from '@/services/email-service'

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
    plugins: [
        bearer(),
        emailOTP({
            sendVerificationOnSignUp: true,
            async sendVerificationOTP({ email, otp, type }, request) {
                await EmailService.sendVerificationOTP(email, otp, type)
            }
        })
    ],
    emailAndPassword: {
        enabled: true,
        autoSignIn: false,
        requireEmailVerification: true,
        sendResetPassword: async ({ user, url, token }, request) => {
            await EmailService.sendResetPasswordLink(user.email, url)
        }
    },
    emailVerification: {
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
