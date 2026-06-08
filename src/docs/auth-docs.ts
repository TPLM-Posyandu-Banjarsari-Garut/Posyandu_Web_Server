import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'

import {
    signUpSchema,
    signInSchema,
    forgetPasswordSchema,
    resetPasswordSchema
} from '@/validations/auth-validation'

export const registerAuthRoutes = (registry: OpenAPIRegistry) => {
    registry.register('SignUpInput', signUpSchema)
    registry.register('SignInInput', signInSchema)
    registry.register('ForgetPasswordInput', forgetPasswordSchema)
    registry.register('ResetPasswordInput', resetPasswordSchema)

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

    // Forget Password
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

    // Reset Password
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
