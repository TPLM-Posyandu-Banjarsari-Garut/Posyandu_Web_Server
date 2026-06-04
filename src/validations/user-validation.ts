import { accountRoleEnum, accountStatusEnum } from '@/constants/enum'
import { z } from 'zod'

export const createUserSchema = z.object({
    name: z
        .string()
        .min(1, 'Name is required')
        .max(100, 'Name cannot exceed 100 characters'),

    email: z
        .email('Invalid email format')
        .min(1, 'Email is required')
        .max(255, 'Email cannot exceed 255 characters'),

    password: z.string().min(6, 'Password must be at least 6 characters'),

    phone_number: z
        .string()
        .max(20, 'Phone number cannot exceed 20 characters')
        .regex(/^[0-9\-+\s]*$/, 'Invalid phone number format')
        .optional()
        .nullable(),

    role: z.enum(accountRoleEnum.enumValues).default('parent'),

    status: z.enum(accountStatusEnum.enumValues).default('active')
})

export const updateUserSchema = createUserSchema.partial().omit({
    email: true
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
