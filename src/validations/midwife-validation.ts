import { midwifes } from '@/db'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'

export const createMidwifeSchema = createInsertSchema(midwifes, {
    user_id: z.number('User ID must be a number').int().positive(),

    posyandu_id: z.number('Posyandu ID must be a number').int().positive(),

    license_number: z
        .string()
        .max(50, 'License number (SIPB) cannot exceed 50 characters')
        .optional()
        .nullable()
}).omit({
    id: true,
    public_id: true,
    created_at: true,
    updated_at: true,
    deleted_at: true
})

export const getMidwifesQuerySchema = z.object({
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

    user_id: z
        .string()
        .optional()
        .transform(val => (val ? Number.parseInt(val, 10) : undefined)),

    posyandu_id: z
        .string()
        .optional()
        .transform(val => (val ? Number.parseInt(val, 10) : undefined)),

    license_number: z.string().optional()
})

export const midwifeParamsSchema = z.object({
    public_id: z.string().min(1, 'Public ID is required')
})

export const updateMidwifeSchema = createMidwifeSchema.partial()

export type CreateMidwifeInput = z.infer<typeof createMidwifeSchema>
export type UpdateMidwifeInput = z.infer<typeof updateMidwifeSchema>
export type GetMidwifesQueryInput = z.infer<typeof getMidwifesQuerySchema>
export type MidwifeParamInput = z.infer<typeof midwifeParamsSchema>
