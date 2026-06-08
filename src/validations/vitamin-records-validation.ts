import {
    distributionPeriodEnum,
    serviceLocationTypeEnum,
    syncStatusEnum,
    vitaminRecordStatusEnum,
    vitaminRecords
} from '@/db'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const createVitaminRecordSchema = createInsertSchema(vitaminRecords, {
    children_id: z
        .string()
        .min(1, 'Children ID is required')
        .openapi({ example: 'child-123' }),

    vitamin_id: z
        .string()
        .min(1, 'Vitamin ID is required')
        .openapi({ example: 'vit-123' }),

    cadre_id: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: 'cadre-123' }),

    midwife_id: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: 'midwife-123' }),

    posyandu_id: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: 'posyandu-123' }),

    distribution_period: z.enum(distributionPeriodEnum.enumValues),

    distribution_year: z
        .number()
        .int()
        .positive('Distribution year must be a positive integer')
        .openapi({ example: 2026 }),

    date_given: z
        .string()
        .optional()
        .nullable()
        .transform(val => (val ? new Date(val) : null))
        .openapi({ type: 'string', format: 'date', example: '2026-06-08' }),

    status: z.enum(vitaminRecordStatusEnum.enumValues).default('not_yet'),

    given_deworming: z.boolean().default(false),

    is_sweeping: z.boolean().default(false),

    is_received: z.boolean().optional().nullable(),

    location_type: z
        .enum(serviceLocationTypeEnum.enumValues)
        .optional()
        .nullable(),

    sync_status: z.enum(syncStatusEnum.enumValues).default('pending'),

    external_ref_id: z
        .string()
        .max(100, 'External reference ID cannot exceed 100 characters')
        .optional()
        .nullable()
        .openapi({ example: 'ext-ref-abc' }),

    special_condition_notes: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: 'Anak sedang demam ringan' }),

    notes: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: 'Vitamin A merah dosis penuh' })
})
    .omit({
        id: true,
        created_at: true,
        updated_at: true,
        deleted_at: true
    })
    .openapi('CreateVitaminRecordInput')

export const getVitaminRecordsQuerySchema = z
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

        children_id: z.string().optional(),
        vitamin_id: z.string().optional(),
        posyandu_id: z.string().optional(),
        cadre_id: z.string().optional(),
        midwife_id: z.string().optional(),
        status: z.enum(vitaminRecordStatusEnum.enumValues).optional(),
        distribution_period: z
            .enum(distributionPeriodEnum.enumValues)
            .optional(),
        distribution_year: z
            .string()
            .optional()
            .transform(val => (val ? Number.parseInt(val, 10) : undefined)),
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
    .openapi('GetVitaminRecordsQuery')

export const vitaminRecordParamsSchema = z
    .object({
        public_id: z
            .string()
            .min(1, 'Public ID is required')
            .openapi({ example: 'vit-rec-xyz-123' })
    })
    .openapi('VitaminRecordParams')

export const deleteVitaminRecordQuerySchema = z
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
    .openapi('DeleteVitaminRecordQuery')

export const updateVitaminRecordSchema = createVitaminRecordSchema
    .partial()
    .openapi('UpdateVitaminRecordInput')

export type CreateVitaminRecordInput = z.infer<typeof createVitaminRecordSchema>
export type UpdateVitaminRecordInput = z.infer<typeof updateVitaminRecordSchema>
export type GetVitaminRecordsQueryInput = z.infer<
    typeof getVitaminRecordsQuerySchema
>
export type VitaminRecordParamInput = z.infer<typeof vitaminRecordParamsSchema>
export type DeleteVitaminRecordQueryInput = z.infer<
    typeof deleteVitaminRecordQuerySchema
>
