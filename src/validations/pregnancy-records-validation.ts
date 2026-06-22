import { pregnancyRecords, pregnancyStatusEnum, pregnancyRiskEnum } from '@/db'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'
import { paginationQuerySchema } from './shared-validation'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const createPregnancyRecordSchema = createInsertSchema(
    pregnancyRecords,
    {
        parent_id: z
            .string()
            .min(1, 'Parent ID is required')
            .openapi({ example: 'parent-uuid' }),
        posyandu_id: z
            .string()
            .min(1, 'Posyandu ID is required')
            .openapi({ example: 'posyandu-uuid' }),
        midwife_id: z
            .string()
            .optional()
            .nullable()
            .openapi({ example: 'midwife-uuid' }),
        pregnancy_status: z
            .enum(pregnancyStatusEnum.enumValues)
            .default('first_trimester'),
        risk_level: z.enum(pregnancyRiskEnum.enumValues).default('low'),
        last_menstrual_period: z.coerce.date().optional().nullable(),
        estimated_due_date: z.coerce.date().optional().nullable(),
        gravida: z.number().int().optional().nullable().openapi({ example: 1 }),
        parity: z.number().int().optional().nullable().openapi({ example: 0 }),
        abortus: z.number().int().optional().nullable().openapi({ example: 0 }),
        is_active: z.boolean().default(true),
        notes: z.string().optional().nullable()
    }
)
    .omit({
        is_deleted: true,
        id: true,
        created_at: true,
        updated_at: true,
        deleted_at: true
    })
    .openapi('CreatePregnancyRecordInput')

export const getPregnancyRecordsQuerySchema = z
    .object({
        ...paginationQuerySchema,
        search: z.string().optional(),
        parent_id: z.string().optional(),
        posyandu_id: z.string().optional(),
        pregnancy_status: z.enum(pregnancyStatusEnum.enumValues).optional(),
        risk_level: z.enum(pregnancyRiskEnum.enumValues).optional(),
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
    .openapi('GetPregnancyRecordsQuery')

export const pregnancyRecordParamsSchema = z
    .object({
        public_id: z
            .string()
            .min(1, 'Public ID is required')
            .openapi({ example: 'preg-uuid' })
    })
    .openapi('PregnancyRecordParams')

export const deletePregnancyRecordQuerySchema = z
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
    .openapi('DeletePregnancyRecordQuery')

export const updatePregnancyRecordSchema = createPregnancyRecordSchema
    .partial()
    .openapi('UpdatePregnancyRecordInput')

export type CreatePregnancyRecordInput = z.infer<
    typeof createPregnancyRecordSchema
>
export type UpdatePregnancyRecordInput = z.infer<
    typeof updatePregnancyRecordSchema
>
