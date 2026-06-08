import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

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
            .min(8, 'Password must be at least 8 characters')
            .max(100, 'Password cannot exceed 100 characters')
            .regex(
                /^(?=.*[a-zA-Z])(?=.*\d).+$/,
                'Password must contain at least one letter and one number'
            )
            .openapi({ example: 'P@ssword123' })
    })
    .openapi('SignUpInput')

export const signInSchema = z
    .object({
        email: z
            .string()
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
            .string()
            .email('Invalid email format')
            .max(255, 'Email cannot exceed 255 characters')
            .openapi({ example: 'user@example.com' })
    })
    .openapi('ForgetPasswordInput')

export const resetPasswordSchema = z
    .object({
        newPassword: z
            .string()
            .min(8, 'New password must be at least 8 characters')
            .max(100, 'New password cannot exceed 100 characters')
            .regex(
                /^(?=.*[a-zA-Z])(?=.*\d).+$/,
                'New password must contain at least one letter and one number'
            )
            .openapi({ example: 'NewP@ssword123' }),

        token: z.string().optional().openapi({ example: 'abc123tokenXYZ' })
    })
    .openapi('ResetPasswordInput')

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type ForgetPasswordInput = z.infer<typeof forgetPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
