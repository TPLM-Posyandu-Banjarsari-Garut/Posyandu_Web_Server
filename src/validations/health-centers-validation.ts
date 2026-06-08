import { statusEnum, healthCenters } from '@/db'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const createHealthCenterSchema = createInsertSchema(healthCenters, {
    name: z
        .string()
        .min(3, 'Health Center name must be at least 3 characters')
        .max(100, 'Health Center name cannot exceed 100 characters')
        .openapi({ example: 'Puskesmas Sukajadi' }),

    address_line: z
        .string()
        .min(5, 'Address must be at least 5 characters')
        .optional()
        .nullable()
        .openapi({ example: 'Jl. Sukajadi No. 123' }),

    village_name: z
        .string()
        .max(100, 'Village name cannot exceed 100 characters')
        .optional()
        .nullable()
        .openapi({ example: 'Pasteur' }),

    contact_number: z
        .string()
        .max(20, 'Contact number cannot exceed 20 characters')
        .optional()
        .nullable()
        .openapi({ example: '0222031234' }),

    head_name: z
        .string()
        .max(100, 'Head name cannot exceed 100 characters')
        .optional()
        .nullable()
        .openapi({ example: 'Dr. Budi Santoso' }),

    status: z.enum(statusEnum.enumValues).default('active')
})
    .omit({
        id: true,
        created_at: true,
        updated_at: true,
        deleted_at: true
    })
    .openapi('CreateHealthCenterInput')

export const getHealthCentersQuerySchema = z
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

        status: z.enum(statusEnum.enumValues).optional(),
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
    .openapi('GetHealthCentersQuery')

export const healthCenterParamsSchema = z
    .object({
        public_id: z
            .string()
            .min(1, 'Public ID is required')
            .openapi({ example: 'hc-xyz-123' })
    })
    .openapi('HealthCenterParams')

export const deleteHealthCenterQuerySchema = z
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
    .openapi('DeleteHealthCenterQuery')

export const updateHealthCenterSchema = createHealthCenterSchema
    .partial()
    .openapi('UpdateHealthCenterInput')

export type CreateHealthCenterInput = z.infer<typeof createHealthCenterSchema>
export type UpdateHealthCenterInput = z.infer<typeof updateHealthCenterSchema>
export type GetHealthCentersQueryInput = z.infer<
    typeof getHealthCentersQuerySchema
>
export type HealthCenterParamInput = z.infer<typeof healthCenterParamsSchema>
export type DeleteHealthCenterQueryInput = z.infer<
    typeof deleteHealthCenterQuerySchema
>
