import { examinations, examinationTypeEnum } from '@/db'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'
import { paginationQuerySchema } from './shared-validation'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const createExaminationSchema = createInsertSchema(examinations, {
    posyandu_id: z
        .string()
        .min(1, 'Posyandu ID is required')
        .openapi({ example: 'posyandu-uuid' }),
    name: z
        .string()
        .min(1, 'Name is required')
        .openapi({ example: 'Toddler Physical Examination' }),
    description: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: 'Standard physical checkup' }),
    examination_type: z
        .enum(examinationTypeEnum.enumValues)
        .openapi({ example: 'toddler' }),
    target_age_months: z
        .number()
        .int()
        .optional()
        .nullable()
        .openapi({ example: 24 }),
    target_trimester: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: 'all' }),
    checklist_items: z.unknown().optional().nullable(),
    is_active: z.boolean().default(true)
})
    .omit({
        id: true,
        created_at: true,
        updated_at: true,
        deleted_at: true
    })
    .openapi('CreateExaminationInput')

export const getExaminationsQuerySchema = z
    .object({
        ...paginationQuerySchema,
        search: z.string().optional(),
        posyandu_id: z.string().optional(),
        examination_type: z.enum(examinationTypeEnum.enumValues).optional(),
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
    .openapi('GetExaminationsQuery')

export const examinationParamsSchema = z
    .object({
        public_id: z
            .string()
            .min(1, 'Public ID is required')
            .openapi({ example: 'exam-uuid' })
    })
    .openapi('ExaminationParams')

export const deleteExaminationQuerySchema = z
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
    .openapi('DeleteExaminationQuery')

export const updateExaminationSchema = createExaminationSchema
    .partial()
    .openapi('UpdateExaminationInput')

export type CreateExaminationInput = z.infer<typeof createExaminationSchema>
export type UpdateExaminationInput = z.infer<typeof updateExaminationSchema>
