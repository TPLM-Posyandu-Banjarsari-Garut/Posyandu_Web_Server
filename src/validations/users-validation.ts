import { accountRoleEnum, accountStatusEnum, users } from '@/db'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'
import {
    relationIdSchema,
    paginationQuerySchema,
    deleteQuerySchema
} from './shared-validation'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const createUserSchema = createInsertSchema(users, {
    email: z
        .email('Invalid email format')
        .max(255, 'Email cannot exceed 255 characters')
        .openapi({ example: 'user@example.com' }),

    name: z
        .string()
        .min(3, 'Name must be at least 3 characters')
        .max(100, 'Name cannot exceed 100 characters')
        .openapi({ example: 'John Doe' }),

    phone_number: z
        .string()
        .max(20, 'Phone number cannot exceed 20 characters')
        .optional()
        .nullable()
        .openapi({ example: '08123456789' }),

    role: z.enum(accountRoleEnum.enumValues).openapi({ example: 'cadre' }),

    status: z.enum(accountStatusEnum.enumValues).default('active')
})
    .extend({
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .max(100, 'Password cannot exceed 100 characters')
            .openapi({ example: 'P@ssword123' })
    })
    .omit({
        id: true,
        created_at: true,
        updated_at: true,
        deleted_at: true
    })
    .openapi('CreateUserInput')

export const getUsersQuerySchema = z
    .object({
        ...paginationQuerySchema,

        role: z.enum(accountRoleEnum.enumValues).optional(),
        status: z.enum(accountStatusEnum.enumValues).optional(),
        search: z.string().optional(),
        includeDeleted: z
            .string()
            .optional()
            .transform(val => val === 'true')
            .openapi({
                type: 'string',
                enum: ['true', 'false'],
                example: 'false'
            })
    })
    .openapi('GetUsersQuery')

export const userParamsSchema = z
    .object({
        public_id: z
            .string()
            .min(1, 'Public ID is required')
            .openapi({ example: 'user-xyz-123' })
    })
    .openapi('UserParams')

export const deleteUserQuerySchema = z
    .object({
        permanent: z
            .string()
            .optional()
            .transform(val => val === 'true')
            .openapi({
                type: 'string',
                enum: ['true', 'false'],
                example: 'false'
            })
    })
    .openapi('DeleteUserQuery')

export const updateUserSchema = createUserSchema
    .partial()
    .openapi('UpdateUserInput')

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type GetUsersQueryInput = z.infer<typeof getUsersQuerySchema>
export type UserParamInput = z.infer<typeof userParamsSchema>
export type DeleteUserQueryInput = z.infer<typeof deleteUserQuerySchema>
