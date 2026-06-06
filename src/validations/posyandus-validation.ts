import { accountStatusEnum, posyandus } from '@/db'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'

export const createPosyanduSchema = createInsertSchema(posyandus, {
    health_center_id: z
        .number('Health Center ID must be a number')
        .int()
        .positive(),

    name: z
        .string()
        .min(3, 'Posyandu name must be at least 3 characters')
        .max(100, 'Posyandu name cannot exceed 100 characters'),

    address_line: z
        .string()
        .min(5, 'Address must be at least 5 characters')
        .optional()
        .nullable(),

    rt: z
        .string()
        .max(5, 'RT cannot exceed 5 characters')
        .optional()
        .nullable(),
    rw: z
        .string()
        .max(5, 'RW cannot exceed 5 characters')
        .optional()
        .nullable(),
    village_name: z
        .string()
        .max(100, 'Village name cannot exceed 100 characters')
        .optional()
        .nullable(),
    contact_number: z
        .string()
        .max(20, 'Contact number cannot exceed 20 characters')
        .optional()
        .nullable(),

    status: z.enum(accountStatusEnum.enumValues).default('active')
}).omit({
    id: true,
    public_id: true,
    created_at: true,
    updated_at: true,
    deleted_at: true
})

export const getPosyandusQuerySchema = z.object({
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

    health_center_id: z
        .string()
        .optional()
        .transform(val => (val ? Number.parseInt(val, 10) : undefined)),

    status: z.enum(accountStatusEnum.enumValues).optional(),
    search: z.string().optional(),
    includeDeleted: z
        .string()
        .optional()
        .transform(val => val === 'true')
})

export const posyanduParamsSchema = z.object({
    public_id: z.string().min(1, 'Public ID is required')
})

export const deletePosyanduQuerySchema = z.object({
    permanent: z
        .string()
        .optional()
        .transform(val => val === 'true')
})

export const updatePosyanduSchema = createPosyanduSchema.partial()

export type CreatePosyanduInput = z.infer<typeof createPosyanduSchema>
export type UpdatePosyanduInput = z.infer<typeof updatePosyanduSchema>
export type GetPosyandusQueryInput = z.infer<typeof getPosyandusQuerySchema>
export type PosyanduParamInput = z.infer<typeof posyanduParamsSchema>
export type DeletePosyanduQueryInput = z.infer<typeof deletePosyanduQuerySchema>
