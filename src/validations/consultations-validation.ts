import {
    consultationStatusEnum,
    consultationTypeEnum,
    consultations
} from '@/db'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import {
    relationIdSchema,
    paginationQuerySchema,
    deleteQuerySchema
} from './shared-validation'

extendZodWithOpenApi(z)

export const createConsultationSchema = createInsertSchema(consultations, {
    parent_id: relationIdSchema('Parent ID').optional(),
    posyandu_id: relationIdSchema('Posyandu ID').optional(),

    consultation_type: z
        .enum(consultationTypeEnum.enumValues)
        .default('pregnancy')
        .openapi({ example: 'pregnancy' }),

    scheduled_at: z
        .preprocess(
            arg => {
                if (Array.isArray(arg)) {
                    return arg.map(v =>
                        typeof v === 'string' || v instanceof Date
                            ? new Date(v)
                            : v
                    )
                }
                return typeof arg === 'string' || arg instanceof Date
                    ? new Date(arg)
                    : arg
            },
            z.union([
                z.date({ message: 'Scheduled date and time is required' }),
                z.array(z.date()).min(1).max(2)
            ])
        )
        .openapi({
            oneOf: [
                { type: 'string', format: 'date-time' },
                {
                    type: 'array',
                    items: { type: 'string', format: 'date-time' }
                }
            ],
            example: '2026-06-20T10:00:00Z'
        }),

    pregnancy_record_id: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: 'preg-rec-uuid' }),

    children_id: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: 'child-uuid' }),

    notes: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: 'Routine checkup for trimester 2' }),

    midwife_id: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: 'midwife-uuid' }),

    status: z.enum(consultationStatusEnum.enumValues).default('pending')
})
    .omit({
        is_deleted: true,
        id: true,
        actual_start_at: true,
        duration_minutes: true,
        follow_up_required: true,
        follow_up_date: true,
        cancellation_reason: true,
        cadre_id: true,
        created_at: true,
        updated_at: true,
        deleted_at: true
    })
    .refine(
        data => {
            if (data.consultation_type === 'pregnancy') {
                return !!data.pregnancy_record_id
            }
            if (data.consultation_type === 'child_development') {
                return !!data.children_id
            }
            return true
        },
        {
            message:
                'pregnancy_record_id is required for pregnancy consultations, and children_id is required for child_development consultations',
            path: ['pregnancy_record_id', 'children_id']
        }
    )
    .openapi('CreateConsultationInput')

export const updateConsultationSchema = createInsertSchema(consultations, {
    scheduled_at: z
        .preprocess(
            arg =>
                typeof arg === 'string' || arg instanceof Date
                    ? new Date(arg)
                    : arg,
            z.date()
        )
        .optional()
        .openapi({
            type: 'string',
            format: 'date-time',
            example: '2026-06-21T09:00:00Z'
        }),

    notes: z.string().optional().nullable(),
    pregnancy_record_id: z.string().optional().nullable(),
    children_id: z.string().optional().nullable()
})
    .omit({
        is_deleted: true,
        id: true,
        parent_id: true,
        posyandu_id: true,
        actual_start_at: true,
        duration_minutes: true,
        follow_up_required: true,
        follow_up_date: true,
        cancellation_reason: true,
        midwife_id: true,
        cadre_id: true,
        status: true,
        created_at: true,
        updated_at: true,
        deleted_at: true
    })
    .openapi('UpdateConsultationInput')

export const updateConsultationStatusSchema = z
    .object({
        status: z
            .enum(consultationStatusEnum.enumValues)
            .openapi({ example: 'confirmed' }),
        cancellation_reason: z
            .string()
            .optional()
            .nullable()
            .openapi({ example: 'Out of town' }),
        notes: z
            .string()
            .optional()
            .nullable()
            .openapi({ example: 'Confirmed and assigned to Midwife Ani' }),
        duration_minutes: z
            .number()
            .int()
            .optional()
            .nullable()
            .openapi({ example: 30 }),
        follow_up_required: z
            .boolean()
            .optional()
            .default(false)
            .openapi({ example: false }),
        follow_up_date: z
            .preprocess(
                arg =>
                    typeof arg === 'string' || arg instanceof Date
                        ? new Date(arg)
                        : arg,
                z.date().optional().nullable()
            )
            .openapi({ type: 'string', format: 'date', example: '2026-07-20' })
    })
    .refine(
        data => {
            if (data.status === 'cancelled') {
                return !!data.cancellation_reason
            }
            return true
        },
        {
            message: 'cancellation_reason is required when status is cancelled',
            path: ['cancellation_reason']
        }
    )
    .openapi('UpdateConsultationStatusInput')

export const getConsultationsQuerySchema = z
    .object({
        ...paginationQuerySchema,

        parent_id: z.string().optional().openapi({ example: 'parent-uuid' }),
        children_id: z.string().optional().openapi({ example: 'child-uuid' }),
        pregnancy_record_id: z
            .string()
            .optional()
            .openapi({ example: 'preg-uuid' }),
        midwife_id: z.string().optional().openapi({ example: 'midwife-uuid' }),
        cadre_id: z.string().optional().openapi({ example: 'cadre-uuid' }),
        posyandu_id: z
            .string()
            .optional()
            .openapi({ example: 'posyandu-uuid' }),
        status: z.enum(consultationStatusEnum.enumValues).optional(),
        consultation_type: z.enum(consultationTypeEnum.enumValues).optional(),
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
    .openapi('GetConsultationsQuery')

export const consultationParamsSchema = z
    .object({
        public_id: z
            .string()
            .min(1, 'Consultation ID is required')
            .openapi({ example: 'consultation-uuid' })
    })
    .openapi('ConsultationParams')

export const deleteConsultationQuerySchema = deleteQuerySchema

export const getAvailableSlotsQuerySchema = z
    .object({
        posyandu_id: z
            .string({ message: 'Posyandu ID is required' })
            .min(1, 'Posyandu ID is required')
            .openapi({ example: 'posyandu-uuid' }),
        consultation_type: z
            .enum(consultationTypeEnum.enumValues, {
                message: 'Invalid consultation type'
            })
            .openapi({ example: 'pregnancy' }),
        date: z
            .string({ message: 'Date is required' })
            .regex(/^\d{4}-\d{2}-\d{2}$/, {
                message: 'Date must be in YYYY-MM-DD format'
            })
            .openapi({ example: '2026-06-20' }),
        midwife_id: z
            .string()
            .optional()
            .nullable()
            .openapi({ example: 'midwife-uuid' })
    })
    .openapi('GetAvailableSlotsQuery')

export type CreateConsultationInput = z.infer<typeof createConsultationSchema>
export type UpdateConsultationInput = z.infer<typeof updateConsultationSchema>
export type GetAvailableSlotsQueryInput = z.infer<
    typeof getAvailableSlotsQuerySchema
>
export type UpdateConsultationStatusInput = z.infer<
    typeof updateConsultationStatusSchema
>
export type GetConsultationsQueryInput = z.infer<
    typeof getConsultationsQuerySchema
>
export type ConsultationParamInput = z.infer<typeof consultationParamsSchema>
export type DeleteConsultationQueryInput = z.infer<
    typeof deleteConsultationQuerySchema
>
