import { examinationRecords, examinationStatusEnum } from '@/db'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'
import { paginationQuerySchema } from './shared-validation'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const createExaminationRecordSchema = createInsertSchema(
    examinationRecords,
    {
        examination_id: z
            .string()
            .min(1, 'Examination ID is required')
            .openapi({ example: 'exam-uuid' }),
        schedule_id: z
            .string()
            .optional()
            .nullable()
            .openapi({ example: 'schedule-uuid' }),
        posyandu_id: z
            .string()
            .min(1, 'Posyandu ID is required')
            .openapi({ example: 'posyandu-uuid' }),
        children_id: z
            .string()
            .optional()
            .nullable()
            .openapi({ example: 'child-uuid' }),
        parent_id: z
            .string()
            .optional()
            .nullable()
            .openapi({ example: 'parent-uuid' }),
        cadre_id: z
            .string()
            .min(1, 'Cadre ID is required')
            .openapi({ example: 'cadre-uuid' }),
        midwife_id: z
            .string()
            .min(1, 'Midwife ID is required')
            .openapi({ example: 'midwife-uuid' }),
        examination_date: z.coerce.date().openapi({ example: '2026-06-25' }),
        status: z.enum(examinationStatusEnum.enumValues).default('pending'),
        result_summary: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
        medically_validated_at: z.coerce.date().optional().nullable(),
        medically_validated_by_midwife_id: z.string().optional().nullable()
    }
)
    .omit({
        is_deleted: true,
        id: true,
        created_at: true,
        updated_at: true,
        deleted_at: true
    })
    .refine(data => data.children_id || data.parent_id, {
        message: 'Either children_id or parent_id must be provided',
        path: ['children_id']
    })
    .openapi('CreateExaminationRecordInput')

export const getExaminationRecordsQuerySchema = z
    .object({
        ...paginationQuerySchema,
        examination_id: z.string().optional(),
        schedule_id: z.string().optional(),
        posyandu_id: z.string().optional(),
        children_id: z.string().optional(),
        parent_id: z.string().optional(),
        cadre_id: z.string().optional(),
        midwife_id: z.string().optional(),
        status: z.enum(examinationStatusEnum.enumValues).optional(),
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
    .openapi('GetExaminationRecordsQuery')

export const examinationRecordParamsSchema = z
    .object({
        public_id: z
            .string()
            .min(1, 'Public ID is required')
            .openapi({ example: 'record-uuid' })
    })
    .openapi('ExaminationRecordParams')

export const deleteExaminationRecordQuerySchema = z
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
    .openapi('DeleteExaminationRecordQuery')

export const updateExaminationRecordSchema = createInsertSchema(
    examinationRecords,
    {
        examination_date: z.coerce.date().optional()
    }
)
    .omit({
        is_deleted: true,
        id: true,
        created_at: true,
        updated_at: true,
        deleted_at: true
    })
    .partial()
    .openapi('UpdateExaminationRecordInput')

export const validateMedicalRecordSchema = z
    .object({
        medically_validated_by_midwife_id: z
            .string()
            .min(1, 'Midwife ID is required')
            .openapi({ example: 'midwife-uuid' })
    })
    .openapi('ValidateMedicalRecordInput')

export type CreateExaminationRecordInput = z.infer<
    typeof createExaminationRecordSchema
>
export type UpdateExaminationRecordInput = z.infer<
    typeof updateExaminationRecordSchema
>
