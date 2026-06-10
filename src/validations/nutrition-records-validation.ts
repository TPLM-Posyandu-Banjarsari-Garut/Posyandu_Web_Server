import { nutritionRecords, nutritionStatusEnum } from '@/db'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'
import {
    relationIdSchema,
    paginationQuerySchema,
    deleteQuerySchema
} from './shared-validation'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const createNutritionRecordSchema = createInsertSchema(
    nutritionRecords,
    {
        children_id: z
            .string()
            .min(1, 'Children ID is required')
            .openapi({ example: 'child-123' }),

        measurement_date: z
            .string()
            .transform(val => new Date(val))
            .openapi({ type: 'string', format: 'date', example: '2026-06-08' }),

        weight_kg: z
            .string()
            .optional()
            .nullable()
            .openapi({ type: 'string', example: '8.50' }),

        height_cm: z
            .string()
            .optional()
            .nullable()
            .openapi({ type: 'string', example: '72.30' }),

        head_circumference_cm: z
            .string()
            .optional()
            .nullable()
            .openapi({ type: 'string', example: '43.50' }),

        age_months: z
            .number()
            .int()
            .min(0, 'Age months must be 0 or greater')
            .optional()
            .nullable()
            .openapi({ example: 12 }),

        nutrition_status: z.enum(nutritionStatusEnum.enumValues),

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

        notes: z
            .string()
            .optional()
            .nullable()
            .openapi({ example: 'Anak tumbuh baik sesuai usia' })
    }
)
    .omit({
        id: true,
        created_at: true,
        updated_at: true,
        deleted_at: true
    })
    .openapi('CreateNutritionRecordInput')

export const getNutritionRecordsQuerySchema = z
    .object({
        ...paginationQuerySchema,

        children_id: z.string().optional(),
        cadre_id: z.string().optional(),
        midwife_id: z.string().optional(),
        nutrition_status: z.enum(nutritionStatusEnum.enumValues).optional(),
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
    .openapi('GetNutritionRecordsQuery')

export const nutritionRecordParamsSchema = z
    .object({
        public_id: z
            .string()
            .min(1, 'Public ID is required')
            .openapi({ example: 'nut-rec-xyz-123' })
    })
    .openapi('NutritionRecordParams')

export const deleteNutritionRecordQuerySchema = z
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
    .openapi('DeleteNutritionRecordQuery')

export const updateNutritionRecordSchema = createNutritionRecordSchema
    .partial()
    .openapi('UpdateNutritionRecordInput')

export type CreateNutritionRecordInput = z.infer<
    typeof createNutritionRecordSchema
>
export type UpdateNutritionRecordInput = z.infer<
    typeof updateNutritionRecordSchema
>
export type GetNutritionRecordsQueryInput = z.infer<
    typeof getNutritionRecordsQuerySchema
>
export type NutritionRecordParamInput = z.infer<
    typeof nutritionRecordParamsSchema
>
export type DeleteNutritionRecordQueryInput = z.infer<
    typeof deleteNutritionRecordQuerySchema
>
