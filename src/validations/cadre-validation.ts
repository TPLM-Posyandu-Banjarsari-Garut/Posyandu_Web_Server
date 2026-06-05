import { cadrePositionEnum, cadres } from '@/db'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'

export const createCadreSchema = createInsertSchema(cadres, {
    user_id: z.number('User ID must be a number').int().positive(),

    posyandu_id: z.number('Posyandu ID must be a number').int().positive(),

    position: z.enum(cadrePositionEnum.enumValues).default('member')
}).omit({
    id: true,
    public_id: true,
    created_at: true,
    updated_at: true,
    deleted_at: true
})

export const getCadresQuerySchema = z.object({
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

    position: z.enum(cadrePositionEnum.enumValues).optional()
})

export const cadreParamsSchema = z.object({
    public_id: z.string().min(1, 'Public ID is required')
})

export const updateCadreSchema = createCadreSchema.partial()

export type CreateCadreInput = z.infer<typeof createCadreSchema>
export type UpdateCadreInput = z.infer<typeof updateCadreSchema>
export type GetCadresQueryInput = z.infer<typeof getCadresQuerySchema>
export type CadreParamInput = z.infer<typeof cadreParamsSchema>
