import { accountRoleEnum, accountStatusEnum, users } from '@/db'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'

export const createUserSchema = createInsertSchema(users, {
    name: z
        .string()
        .min(1, 'Name is required')
        .max(100, 'Name cannot exceed 100 characters'),

    email: z
        .email('Invalid email format')
        .min(1, 'Email is required')
        .max(255, 'Email cannot exceed 255 characters'),

    password: z
        .string()
        .min(6, 'Password must be at least 6 characters')
        .max(100, 'Password cannot exceed 100 characters'),

    phone_number: z
        .string()
        .max(20, 'Phone number cannot exceed 20 characters')
        .regex(/^[0-9\-+\s]*$/, 'Invalid phone number format')
        .optional()
        .nullable(),
    role: z.enum(accountRoleEnum.enumValues).default('parent'),

    status: z.enum(accountStatusEnum.enumValues).default('active')
}).omit({
    id: true,
    public_id: true,
    created_at: true,
    updated_at: true,
    deleted_at: true
})

export const getUsersQuerySchema = z.object({
    page: z
        .string()
        .optional()
        .default('1')
        .transform(val => Number.parseInt(val, 10)),

    limit: z
        .string()
        .optional()
        .default('10')
        .transform(val => Number.parseInt(val, 10)),

    search: z.string().optional(),
    role: z.string().optional(),
    status: z.string().optional()
})

export const userParamsSchema = z.object({
    public_id: z.string().min(1, 'Public ID is required')
})

export const updateUserSchema = createUserSchema.partial().omit({
    email: true
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type GetUsersQueryInput = z.infer<typeof getUsersQuerySchema>
export type UserParamInput = z.infer<typeof userParamsSchema>
