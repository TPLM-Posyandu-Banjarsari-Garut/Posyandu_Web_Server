import {
    immunizationStatusEnum,
    scheduleComplianceEnum,
    serviceLocationTypeEnum,
    syncStatusEnum,
    immunizationRecords
} from '@/db'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'
import {
    relationIdSchema,
    paginationQuerySchema,
    deleteQuerySchema
} from './shared-validation'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const createImmunizationRecordSchema = createInsertSchema(
    immunizationRecords,
    {
        children_id: z
            .string()
            .min(1, 'Children ID is required')
            .openapi({ example: 'child-123' }),

        vaccine_id: z
            .string()
            .min(1, 'Vaccine ID is required')
            .openapi({ example: 'vac-123' }),

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

        inventory_id: z
            .string()
            .optional()
            .nullable()
            .openapi({ example: 'inv-123' }),

        dose_number: z
            .number()
            .int()
            .positive('Dose number must be a positive integer')
            .openapi({ example: 1 }),

        date_given: z
            .string()
            .optional()
            .nullable()
            .transform(val => (val ? new Date(val) : null))
            .openapi({ type: 'string', format: 'date', example: '2026-06-08' }),

        batch_number: z
            .string()
            .max(50, 'Batch number cannot exceed 50 characters')
            .optional()
            .nullable()
            .openapi({ example: 'BATCH-001' }),

        status: z.enum(immunizationStatusEnum.enumValues).default('scheduled'),

        kipi_status: z.boolean().default(false),

        schedule_compliance: z
            .enum(scheduleComplianceEnum.enumValues)
            .optional()
            .nullable(),

        status_dofu: z.boolean().default(false),

        sync_status: z.enum(syncStatusEnum.enumValues).default('pending'),

        external_ref_id: z
            .string()
            .max(100, 'External reference ID cannot exceed 100 characters')
            .optional()
            .nullable()
            .openapi({ example: 'ext-ref-abc' }),

        location_type: z
            .enum(serviceLocationTypeEnum.enumValues)
            .optional()
            .nullable(),

        notes: z
            .string()
            .optional()
            .nullable()
            .openapi({ example: 'Diberikan tanpa efek samping' })
    }
)
    .omit({
        is_deleted: true,
        id: true,
        created_at: true,
        updated_at: true,
        deleted_at: true
    })
    .openapi('CreateImmunizationRecordInput')

export const getImmunizationRecordsQuerySchema = z
    .object({
        ...paginationQuerySchema,

        children_id: z.string().optional(),
        vaccine_id: z.string().optional(),
        posyandu_id: z.string().optional(),
        cadre_id: z.string().optional(),
        midwife_id: z.string().optional(),
        status: z.enum(immunizationStatusEnum.enumValues).optional(),
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
    .openapi('GetImmunizationRecordsQuery')

export const immunizationRecordParamsSchema = z
    .object({
        public_id: z
            .string()
            .min(1, 'Public ID is required')
            .openapi({ example: 'imm-xyz-123' })
    })
    .openapi('ImmunizationRecordParams')

export const deleteImmunizationRecordQuerySchema = z
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
    .openapi('DeleteImmunizationRecordQuery')

export const updateImmunizationRecordSchema = createImmunizationRecordSchema
    .partial()
    .openapi('UpdateImmunizationRecordInput')

export type CreateImmunizationRecordInput = z.infer<
    typeof createImmunizationRecordSchema
>
export type UpdateImmunizationRecordInput = z.infer<
    typeof updateImmunizationRecordSchema
>
export type GetImmunizationRecordsQueryInput = z.infer<
    typeof getImmunizationRecordsQuerySchema
>
export type ImmunizationRecordParamInput = z.infer<
    typeof immunizationRecordParamsSchema
>
export type DeleteImmunizationRecordQueryInput = z.infer<
    typeof deleteImmunizationRecordQuerySchema
>
