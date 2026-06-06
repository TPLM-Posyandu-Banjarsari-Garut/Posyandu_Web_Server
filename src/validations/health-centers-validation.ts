import { statusEnum, healthCenters } from '@/db'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'

export const createHealthCenterSchema = createInsertSchema(healthCenters, {
    name: z
        .string()
        .min(3, 'Health Center name must be at least 3 characters')
        .max(100, 'Health Center name cannot exceed 100 characters'),

    address_line: z
        .string()
        .min(5, 'Address must be at least 5 characters')
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

    head_name: z
        .string()
        .max(100, 'Head name cannot exceed 100 characters')
        .optional()
        .nullable(),

    status: z.enum(statusEnum.enumValues).default('active')
}).omit({
    id: true,
    public_id: true,
    created_at: true,
    updated_at: true,
    deleted_at: true
})

export const getHealthCentersQuerySchema = z.object({
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

    status: z.enum(statusEnum.enumValues).optional(),
    search: z.string().optional(),
    includeDeleted: z
        .string()
        .optional()
        .transform(val => val === 'true')
})

export const healthCenterParamsSchema = z.object({
    public_id: z.string().min(1, 'Public ID is required')
})

export const deleteHealthCenterQuerySchema = z.object({
    permanent: z
        .string()
        .optional()
        .transform(val => val === 'true')
})

export const updateHealthCenterSchema = createHealthCenterSchema.partial()

export type CreateHealthCenterInput = z.infer<typeof createHealthCenterSchema>
export type UpdateHealthCenterInput = z.infer<typeof updateHealthCenterSchema>
export type GetHealthCentersQueryInput = z.infer<
    typeof getHealthCentersQuerySchema
>
export type HealthCenterParamInput = z.infer<typeof healthCenterParamsSchema>
export type DeleteHealthCenterQueryInput = z.infer<
    typeof deleteHealthCenterQuerySchema
>
