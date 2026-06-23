import { accountRoleEnum, accountStatusEnum, users } from '@/db'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'
import {
    relationIdSchema,
    paginationQuerySchema,
    deleteQuerySchema
} from './shared-validation'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

import { createParentSchema } from './parents-validation'
import { createCadreSchema } from './cadres-validation'
import { createMidwifeSchema } from './midwifes-validation'

extendZodWithOpenApi(z)

export const baseCreateUserSchema = createInsertSchema(users, {
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

    role: z
        .enum(['posyandu_admin', 'village_admin', 'midwife', 'cadre', 'parent'])
        .openapi({ example: 'cadre' }),

    avatar_url: z
        .string()
        .url({ message: 'Must be a valid URL' })
        .optional()
        .nullable()
        .openapi({
            description:
                'User avatar URL (uploaded via /api/medias/upload first)',
            example:
                'https://media.posyandubanjarsari.my.id/medias/uuid-avatar.webp'
        }),

    status: z.enum(accountStatusEnum.enumValues).default('active')
})
    .extend({
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .max(100, 'Password cannot exceed 100 characters')
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                'Password must contain uppercase, lowercase, and number'
            )
            .openapi({ example: 'P@ssword123' }),
        parent_data: createParentSchema
            .omit({ user_id: true })
            .optional()
            .nullable()
            .openapi({
                description: 'Parent profile data. Required if role is parent.'
            }),
        cadre_data: createCadreSchema
            .omit({ user_id: true })
            .optional()
            .nullable()
            .openapi({
                description:
                    'Cadre profile data. Required if role is cadre. Note: posyandu_id is required when role is cadre.'
            }),
        midwife_data: createMidwifeSchema
            .omit({ user_id: true })
            .optional()
            .nullable()
            .openapi({
                description:
                    'Midwife profile data. Required if role is midwife. Note: posyandu_id and identity_number (NIK) are required when role is midwife.'
            })
    })
    .omit({
        is_deleted: true,
        id: true,
        created_at: true,
        updated_at: true,
        deleted_at: true
    })

export const createUserSchema = baseCreateUserSchema
    .superRefine((data, ctx) => {
        if (data.role === 'cadre') {
            if (!data.cadre_data?.posyandu_id) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'posyandu_id is required for cadre role',
                    path: ['cadre_data', 'posyandu_id']
                })
            }
        }
        if (data.role === 'midwife') {
            if (!data.midwife_data?.posyandu_id) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'posyandu_id is required for midwife role',
                    path: ['midwife_data', 'posyandu_id']
                })
            }
            if (!data.midwife_data?.identity_number) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'identity_number is required for midwife role',
                    path: ['midwife_data', 'identity_number']
                })
            }
        }
    })
    .openapi('CreateUserInput')

export const getUsersQuerySchema = z
    .object({
        ...paginationQuerySchema,

        role: z
            .enum([
                'posyandu_admin',
                'village_admin',
                'midwife',
                'cadre',
                'parent'
            ])
            .optional(),
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

export const updateUserSchema = baseCreateUserSchema
    .partial()
    .openapi('UpdateUserInput')

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type GetUsersQueryInput = z.infer<typeof getUsersQuerySchema>
export type UserParamInput = z.infer<typeof userParamsSchema>
export type DeleteUserQueryInput = z.infer<typeof deleteUserQuerySchema>
