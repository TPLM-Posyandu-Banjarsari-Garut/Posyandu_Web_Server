import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

import {
    signUpSchema,
    signInSchema,
    forgetPasswordSchema,
    resetPasswordSchema,
    signInSocialSchema,
    verifyEmailOTPSchema,
    sendVerificationOTPSchema,
    resetPasswordOTPSchema
} from '@/validations/auth-validation'

export const registerAuthRoutes = (registry: OpenAPIRegistry) => {
    registry.register('SignUpInput', signUpSchema)
    registry.register('SignInInput', signInSchema)
    registry.register('ForgetPasswordInput', forgetPasswordSchema)
    registry.register('ResetPasswordInput', resetPasswordSchema)
    registry.register('SignInSocialInput', signInSocialSchema)
    registry.register('VerifyEmailOTPInput', verifyEmailOTPSchema)
    registry.register('SendVerificationOTPInput', sendVerificationOTPSchema)
    registry.register('ResetPasswordOTPInput', resetPasswordOTPSchema)

    const AUTH_TAG = ['Authentication (Better Auth)']

    const registerSimplePost = (
        path: string,
        summary: string,
        schema: z.ZodTypeAny,
        successDescription: string,
        errorStatus: number = 400,
        errorDescription: string = 'Bad Request'
    ) => {
        registry.registerPath({
            method: 'post',
            path,
            tags: AUTH_TAG,
            summary,
            request: {
                body: {
                    content: {
                        'application/json': { schema }
                    }
                }
            },
            responses: {
                200: { description: successDescription },
                [errorStatus]: { description: errorDescription }
            }
        })
    }

    registerSimplePost(
        '/api/auth/sign-up/email',
        'Register a new user',
        signUpSchema,
        'User registered successfully'
    )

    registerSimplePost(
        '/api/auth/sign-in/email',
        'Login using email and password',
        signInSchema,
        'Login successful',
        401,
        'Unauthorized / Invalid credentials'
    )

    registerSimplePost(
        '/api/auth/email-otp/verify-email',
        'Verify email address with OTP code',
        verifyEmailOTPSchema,
        'Verification successful'
    )

    registerSimplePost(
        '/api/auth/email-otp/send-verification-otp',
        'Resend email verification OTP code',
        sendVerificationOTPSchema,
        'OTP sent successfully'
    )

    registerSimplePost(
        '/api/auth/email-otp/request-password-reset',
        'Request a password reset OTP',
        sendVerificationOTPSchema,
        'Reset password OTP sent successfully'
    )

    registerSimplePost(
        '/api/auth/email-otp/reset-password',
        'Reset password using OTP code',
        resetPasswordOTPSchema,
        'Password reset successful'
    )

    registerSimplePost(
        '/api/auth/forget-password',
        'Request a password reset link',
        forgetPasswordSchema,
        'Reset link sent'
    )

    registerSimplePost(
        '/api/auth/reset-password',
        'Reset password using token',
        resetPasswordSchema,
        'Password reset successful'
    )

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
}
