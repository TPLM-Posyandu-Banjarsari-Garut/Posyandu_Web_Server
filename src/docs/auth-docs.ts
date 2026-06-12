import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

import {
    signUpSchema,
    signInSchema,
    forgetPasswordSchema,
    resetPasswordSchema
} from '@/validations/auth-validation'

export const registerAuthRoutes = (registry: OpenAPIRegistry) => {
    const signInSocialSchema = z
        .object({
            provider: z.enum(['google']).openapi({ example: 'google' }),
            callbackURL: z
                .string()
                .openapi({ example: 'http://localhost:3000/dashboard' })
        })
        .openapi('SignInSocialInput')

    const verifyEmailOTPSchema = z
        .object({
            email: z.string().email().openapi({ example: 'user@example.com' }),
            otp: z.string().openapi({ example: '123456' })
        })
        .openapi('VerifyEmailOTPInput')

    const sendVerificationOTPSchema = z
        .object({
            email: z.string().email().openapi({ example: 'user@example.com' })
        })
        .openapi('SendVerificationOTPInput')

    const resetPasswordOTPSchema = z
        .object({
            email: z.string().email().openapi({ example: 'user@example.com' }),
            otp: z.string().openapi({ example: '123456' }),
            password: z
                .string()
                .min(8, 'Password must be at least 8 characters')
                .max(100, 'Password cannot exceed 100 characters')
                .regex(
                    /^(?=.*[a-zA-Z])(?=.*\d).+$/,
                    'Password must contain at least one letter and one number'
                )
                .openapi({ example: 'NewP@ssword123' })
        })
        .openapi('ResetPasswordOTPInput')

    registry.register('SignUpInput', signUpSchema)
    registry.register('SignInInput', signInSchema)
    registry.register('ForgetPasswordInput', forgetPasswordSchema)
    registry.register('ResetPasswordInput', resetPasswordSchema)
    registry.register('SignInSocialInput', signInSocialSchema)
    registry.register('VerifyEmailOTPInput', verifyEmailOTPSchema)
    registry.register('SendVerificationOTPInput', sendVerificationOTPSchema)
    registry.register('ResetPasswordOTPInput', resetPasswordOTPSchema)

    const AUTH_TAG = ['Authentication (Better Auth)']

    registry.registerPath({
        method: 'post',
        path: '/api/auth/sign-up/email',
        tags: AUTH_TAG,
        summary: 'Register a new user',
        request: {
            body: {
                content: { 'application/json': { schema: signUpSchema } }
            }
        },
        responses: {
            200: { description: 'User registered successfully' },
            400: { description: 'Bad Request' }
        }
    })

    registry.registerPath({
        method: 'post',
        path: '/api/auth/sign-in/email',
        tags: AUTH_TAG,
        summary: 'Login using email and password',
        request: {
            body: {
                content: { 'application/json': { schema: signInSchema } }
            }
        },
        responses: {
            200: { description: 'Login successful' },
            401: { description: 'Unauthorized / Invalid credentials' }
        }
    })

    registry.registerPath({
        method: 'post',
        path: '/api/auth/sign-in/social',
        tags: AUTH_TAG,
        summary: 'Social login provider initiator',
        request: {
            body: {
                content: { 'application/json': { schema: signInSocialSchema } }
            }
        },
        responses: {
            200: {
                description: 'Returns OAuth redirection URL',
                content: {
                    'application/json': {
                        schema: z.object({ url: z.string() })
                    }
                }
            },
            400: { description: 'Bad Request' }
        }
    })

    registry.registerPath({
        method: 'post',
        path: '/api/auth/email-otp/verify-email',
        tags: AUTH_TAG,
        summary: 'Verify email address with OTP code',
        request: {
            body: {
                content: {
                    'application/json': { schema: verifyEmailOTPSchema }
                }
            }
        },
        responses: {
            200: { description: 'Verification successful' },
            400: { description: 'Bad Request' }
        }
    })

    registry.registerPath({
        method: 'post',
        path: '/api/auth/email-otp/send-verification-otp',
        tags: AUTH_TAG,
        summary: 'Resend email verification OTP code',
        request: {
            body: {
                content: {
                    'application/json': { schema: sendVerificationOTPSchema }
                }
            }
        },
        responses: {
            200: { description: 'OTP sent successfully' },
            400: { description: 'Bad Request' }
        }
    })

    registry.registerPath({
        method: 'post',
        path: '/api/auth/email-otp/request-password-reset',
        tags: AUTH_TAG,
        summary: 'Request a password reset OTP',
        request: {
            body: {
                content: {
                    'application/json': { schema: sendVerificationOTPSchema }
                }
            }
        },
        responses: {
            200: { description: 'Reset password OTP sent successfully' },
            400: { description: 'Bad Request' }
        }
    })

    registry.registerPath({
        method: 'post',
        path: '/api/auth/email-otp/reset-password',
        tags: AUTH_TAG,
        summary: 'Reset password using OTP code',
        request: {
            body: {
                content: {
                    'application/json': { schema: resetPasswordOTPSchema }
                }
            }
        },
        responses: {
            200: { description: 'Password reset successful' },
            400: { description: 'Bad Request' }
        }
    })

    registry.registerPath({
        method: 'post',
        path: '/api/auth/sign-out',
        tags: AUTH_TAG,
        summary: 'Logout current session',
        security: [{ BearerAuth: [] }],
        responses: {
            200: { description: 'Logout successful' },
            401: { description: 'Unauthorized' }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/api/auth/me',
        tags: AUTH_TAG,
        summary: 'Get active session data',
        security: [{ BearerAuth: [] }],
        responses: {
            200: { description: 'Session retrieved' },
            401: { description: 'Unauthorized' }
        }
    })

    registry.registerPath({
        method: 'post',
        path: '/api/auth/forget-password',
        tags: AUTH_TAG,
        summary: 'Request a password reset link',
        request: {
            body: {
                content: {
                    'application/json': { schema: forgetPasswordSchema }
                }
            }
        },
        responses: {
            200: { description: 'Reset link sent' },
            400: { description: 'Bad Request' }
        }
    })

    registry.registerPath({
        method: 'post',
        path: '/api/auth/reset-password',
        tags: AUTH_TAG,
        summary: 'Reset password using token',
        request: {
            body: {
                content: { 'application/json': { schema: resetPasswordSchema } }
            }
        },
        responses: {
            200: { description: 'Password reset successful' },
            400: { description: 'Bad Request' }
        }
    })
}
