import { capsuleColorEnum, vitamins } from '@/db'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'
import {
    relationIdSchema,
    paginationQuerySchema,
    deleteQuerySchema
} from './shared-validation'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const createVitaminSchema = createInsertSchema(vitamins, {
    name: z
        .string()
        .min(3, 'Vitamin name must be at least 3 characters')
        .max(100, 'Vitamin name cannot exceed 100 characters')
        .openapi({ example: 'Vitamin A Biru' }),

    description: z
        .string()
        .min(5, 'Description must be at least 5 characters')
        .optional()
        .nullable()
        .openapi({ example: 'Vitamin A 100.000 IU untuk bayi 6-11 bulan' }),

    capsule_color: z
        .enum(capsuleColorEnum.enumValues)
        .openapi({ example: 'blue' }),

    dosage_iu: z
        .number()
        .int()
        .positive('Dosage IU must be a positive integer')
        .openapi({ example: 100000 }),

    min_age_months: z
        .number()
        .int()
        .positive('Min age months must be a positive integer')
        .optional()
        .nullable()
        .openapi({ example: 6 }),

    max_age_months: z
        .number()
        .int()
        .positive('Max age months must be a positive integer')
        .optional()
        .nullable()
        .openapi({ example: 11 }),

    distributions_per_year: z
        .number()
        .int()
        .positive('Distributions per year must be a positive integer')
        .optional()
        .nullable()
        .openapi({ example: 2 }),

    target_age_months: z
        .number()
        .int()
        .positive('Target age months must be a positive integer')
        .optional()
        .nullable()
        .openapi({ example: 6 })
})
    .omit({
        id: true,
        created_at: true,
        updated_at: true,
        deleted_at: true
    })
    .openapi('CreateVitaminInput')

export const getVitaminsQuerySchema = z
    .object({
        ...paginationQuerySchema,

        capsule_color: z.enum(capsuleColorEnum.enumValues).optional(),
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
    .openapi('GetVitaminsQuery')

export const vitaminParamsSchema = z
    .object({
        public_id: z
            .string()
            .min(1, 'Public ID is required')
            .openapi({ example: 'vit-xyz-123' })
    })
    .openapi('VitaminParams')

export const deleteVitaminQuerySchema = z
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
    .openapi('DeleteVitaminQuery')

export const updateVitaminSchema = createVitaminSchema
    .partial()
    .openapi('UpdateVitaminInput')

export type CreateVitaminInput = z.infer<typeof createVitaminSchema>
export type UpdateVitaminInput = z.infer<typeof updateVitaminSchema>
export type GetVitaminsQueryInput = z.infer<typeof getVitaminsQuerySchema>
export type VitaminParamInput = z.infer<typeof vitaminParamsSchema>
export type DeleteVitaminQueryInput = z.infer<typeof deleteVitaminQuerySchema>
