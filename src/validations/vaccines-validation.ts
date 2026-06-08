import { vaccines, vaccineRouteEnum } from '@/db'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const createVaccineSchema = createInsertSchema(vaccines, {
    code: z
        .string()
        .min(1, 'Vaccine code is required')
        .max(10, 'Vaccine code cannot exceed 10 characters')
        .openapi({ example: 'BCG' }),

    name: z
        .string()
        .min(3, 'Vaccine name must be at least 3 characters')
        .max(100, 'Vaccine name cannot exceed 100 characters')
        .openapi({ example: 'BCG (Bacillus Calmette-Guérin)' }),

    description: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: 'Vaksin untuk mencegah tuberkulosis (TBC)' }),

    target_age_months: z
        .number()
        .int()
        .min(0, 'Target age months must be 0 or greater')
        .optional()
        .nullable()
        .openapi({ example: 0 }),

    max_doses: z
        .number()
        .int()
        .positive('Max doses must be a positive integer')
        .optional()
        .nullable()
        .openapi({ example: 1 }),

    min_interval_days: z
        .number()
        .int()
        .min(0, 'Min interval days must be 0 or greater')
        .optional()
        .nullable()
        .openapi({ example: 0 }),

    route: z.enum(vaccineRouteEnum.enumValues).optional().nullable()
})
    .omit({
        id: true,
        created_at: true,
        updated_at: true,
        deleted_at: true
    })
    .openapi('CreateVaccineInput')

export const getVaccinesQuerySchema = z
    .object({
        page: z
            .string()
            .optional()
            .default('1')
            .transform(val => Number.parseInt(val, 10))
            .openapi({ type: 'string', default: '1', example: '1' }),

        limit: z
            .string()
            .optional()
            .default('10')
            .transform(val => Number.parseInt(val, 10))
            .openapi({ type: 'string', default: '10', example: '10' }),

        route: z.enum(vaccineRouteEnum.enumValues).optional(),
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
    .openapi('GetVaccinesQuery')

export const vaccineParamsSchema = z
    .object({
        public_id: z
            .string()
            .min(1, 'Public ID is required')
            .openapi({ example: 'vac-xyz-123' })
    })
    .openapi('VaccineParams')

export const deleteVaccineQuerySchema = z
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
    .openapi('DeleteVaccineQuery')

export const updateVaccineSchema = createVaccineSchema
    .partial()
    .openapi('UpdateVaccineInput')

export type CreateVaccineInput = z.infer<typeof createVaccineSchema>
export type UpdateVaccineInput = z.infer<typeof updateVaccineSchema>
export type GetVaccinesQueryInput = z.infer<typeof getVaccinesQuerySchema>
export type VaccineParamInput = z.infer<typeof vaccineParamsSchema>
export type DeleteVaccineQueryInput = z.infer<typeof deleteVaccineQuerySchema>
