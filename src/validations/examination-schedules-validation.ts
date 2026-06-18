import { examinationSchedules, examinationStatusEnum } from '@/db'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'
import { paginationQuerySchema } from './shared-validation'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const createExaminationScheduleSchema = createInsertSchema(
    examinationSchedules,
    {
        examination_id: z
            .string()
            .min(1, 'Examination ID is required')
            .openapi({ example: 'exam-uuid' }),
        posyandu_id: z
            .string()
            .min(1, 'Posyandu ID is required')
            .openapi({ example: 'posyandu-uuid' }),
        midwife_id: z
            .string()
            .optional()
            .nullable()
            .openapi({ example: 'midwife-uuid' }),
        cadre_id: z
            .string()
            .optional()
            .nullable()
            .openapi({ example: 'cadre-uuid' }),
        scheduled_date: z.coerce.date().openapi({ example: '2026-06-25' }),
        start_time: z
            .string()
            .optional()
            .nullable()
            .openapi({ example: '08:00' }),
        end_time: z
            .string()
            .optional()
            .nullable()
            .openapi({ example: '11:00' }),
        max_participants: z
            .number()
            .int()
            .optional()
            .default(20)
            .openapi({ example: 20 }),
        current_participants: z.number().int().optional().default(0),
        location_notes: z
            .string()
            .optional()
            .nullable()
            .openapi({ example: 'Main Posyandu Hall' }),
        status: z.enum(examinationStatusEnum.enumValues).default('pending'),
        notes: z.string().optional().nullable()
    }
)
    .omit({
        id: true,
        created_at: true,
        updated_at: true,
        deleted_at: true
    })
    .openapi('CreateExaminationScheduleInput')

export const getExaminationSchedulesQuerySchema = z
    .object({
        ...paginationQuerySchema,
        posyandu_id: z.string().optional(),
        examination_id: z.string().optional(),
        midwife_id: z.string().optional(),
        cadre_id: z.string().optional(),
        status: z.enum(examinationStatusEnum.enumValues).optional(),
        scheduled_date: z
            .string()
            .optional()
            .openapi({ example: '2026-06-25' }),
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
    .openapi('GetExaminationSchedulesQuery')

export const examinationScheduleParamsSchema = z
    .object({
        public_id: z
            .string()
            .min(1, 'Public ID is required')
            .openapi({ example: 'schedule-uuid' })
    })
    .openapi('ExaminationScheduleParams')

export const deleteExaminationScheduleQuerySchema = z
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
    .openapi('DeleteExaminationScheduleQuery')

export const updateExaminationScheduleSchema = createExaminationScheduleSchema
    .partial()
    .openapi('UpdateExaminationScheduleInput')

export const updateScheduleStatusSchema = z
    .object({
        status: z
            .enum(examinationStatusEnum.enumValues)
            .openapi({ example: 'completed' })
    })
    .openapi('UpdateScheduleStatusInput')

export type CreateExaminationScheduleInput = z.infer<
    typeof createExaminationScheduleSchema
>
export type UpdateExaminationScheduleInput = z.infer<
    typeof updateExaminationScheduleSchema
>
