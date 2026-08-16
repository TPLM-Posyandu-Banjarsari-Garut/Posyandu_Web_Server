import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import env from '@/configs/env'

const TRUSTED_CALLBACK_ORIGINS = [env.CORS_ORIGIN, ...env.TRUSTED_ORIGINS]

extendZodWithOpenApi(z)

export const signUpSchema = z
    .object({
        name: z
            .string()
            .min(3, 'Name must be at least 3 characters')
            .max(100, 'Name cannot exceed 100 characters')
            .openapi({ example: 'John Doe' }),

        email: z
            .email('Invalid email format')
            .max(255, 'Email cannot exceed 255 characters')
            .openapi({ example: 'user@example.com' }),

        password: z
            .string()
            .min(12, 'Password must be at least 12 characters')
            .max(100, 'Password cannot exceed 100 characters')
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).+$/,
                'Password must contain uppercase, lowercase, number, and special character'
            )
            .openapi({ example: 'P@ssw0rd!Secure' }),

        phone_number: z
            .string()
            .max(20, 'Phone number cannot exceed 20 characters')
            .optional()
            .nullable()
            .openapi({ example: '08123456789' })
    })
    .openapi('SignUpInput')

export const signInSchema = z
    .object({
        email: z
            .email('Invalid email format')
            .max(255, 'Email cannot exceed 255 characters')
            .openapi({ example: 'user@example.com' }),

        password: z
            .string()
            .min(1, 'Password is required')
            .max(100, 'Password cannot exceed 100 characters')
            .openapi({ example: 'P@ssword123' })
    })
    .openapi('SignInInput')

export const forgetPasswordSchema = z
    .object({
        email: z
            .email('Invalid email format')
            .max(255, 'Email cannot exceed 255 characters')
            .openapi({ example: 'user@example.com' })
    })
    .openapi('ForgetPasswordInput')

export const resetPasswordSchema = z
    .object({
        newPassword: z
            .string()
            .min(12, 'New password must be at least 12 characters')
            .max(100, 'New password cannot exceed 100 characters')
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).+$/,
                'New password must contain uppercase, lowercase, number, and special character'
            )
            .openapi({ example: 'NewP@ssw0rd!Secure' }),

        token: z.string().optional().openapi({ example: 'abc123tokenXYZ' })
    })
    .openapi('ResetPasswordInput')

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type ForgetPasswordInput = z.infer<typeof forgetPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

export const signInSocialSchema = z
    .object({
        provider: z.enum(['google']).openapi({ example: 'google' }),
        callbackURL: z
            .string()
            .url('callbackURL must be a valid absolute URL')
            .refine(
                url =>
                    TRUSTED_CALLBACK_ORIGINS.some(origin =>
                        url.startsWith(origin)
                    ),
                {
                    message:
                        'callbackURL must point to a trusted origin. Use the full absolute URL of the client app'
                }
            )
            .default(`${env.CORS_ORIGIN}/`)
            .openapi({ example: `${env.CORS_ORIGIN}/dashboard` })
    })
    .openapi('SignInSocialInput')

export const verifyEmailOTPSchema = z
    .object({
        email: z.string().email().openapi({ example: 'user@example.com' }),
        otp: z.string().openapi({ example: '123456' })
    })
    .openapi('VerifyEmailOTPInput')

export const sendVerificationOTPSchema = z
    .object({
        email: z.string().email().openapi({ example: 'user@example.com' }),
        type: z
            .enum([
                'email-verification',
                'sign-in',
                'forget-password',
                'change-email'
            ])
            .default('email-verification')
            .openapi({ example: 'email-verification' })
    })
    .openapi('SendVerificationOTPInput')

export const resetPasswordOTPSchema = z
    .object({
        email: z.string().email().openapi({ example: 'user@example.com' }),
        otp: z.string().openapi({ example: '123456' }),
        password: z
            .string()
            .min(12, 'Password must be at least 12 characters')
            .max(100, 'Password cannot exceed 100 characters')
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).+$/,
                'Password must contain uppercase, lowercase, number, and special character'
            )
            .openapi({ example: 'NewP@ssw0rd!Secure' })
    })
    .openapi('ResetPasswordOTPInput')

export type SignInSocialInput = z.infer<typeof signInSocialSchema>
export type VerifyEmailOTPInput = z.infer<typeof verifyEmailOTPSchema>
export type SendVerificationOTPInput = z.infer<typeof sendVerificationOTPSchema>
export type ResetPasswordOTPInput = z.infer<typeof resetPasswordOTPSchema>
