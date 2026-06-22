import { kipiDetails, kipiSeverityEnum } from '@/db'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'
import {
    relationIdSchema,
    paginationQuerySchema,
    deleteQuerySchema
} from './shared-validation'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const createKipiDetailSchema = createInsertSchema(kipiDetails, {
    immunization_record_id: z
        .string()
        .min(1, 'Immunization record ID is required')
        .openapi({ example: 'imm-xyz-123' }),

    symptoms: z
        .string()
        .min(3, 'Symptoms must be at least 3 characters')
        .openapi({ example: 'Demam tinggi, kemerahan di area suntikan' }),

    severity: z.enum(kipiSeverityEnum.enumValues).openapi({ example: 'mild' }),

    action_taken: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: 'Diberikan obat penurun demam' }),

    referred: z.boolean().default(false)
})
    .omit({
        is_deleted: true,
        id: true,
        created_at: true,
        updated_at: true,
        deleted_at: true
    })
    .openapi('CreateKipiDetailInput')

export const getKipiDetailsQuerySchema = z
    .object({
        ...paginationQuerySchema,

        immunization_record_id: z.string().optional(),
        severity: z.enum(kipiSeverityEnum.enumValues).optional(),
        referred: z
            .string()
            .optional()
            .transform(val => {
                if (val === 'true') return true
                if (val === 'false') return false
                return undefined
            })
            .openapi({
                type: 'string',
                enum: ['true', 'false'],
                example: 'false'
            }),
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
    .openapi('GetKipiDetailsQuery')

export const kipiDetailParamsSchema = z
    .object({
        public_id: z
            .string()
            .min(1, 'Public ID is required')
            .openapi({ example: 'kipi-xyz-123' })
    })
    .openapi('KipiDetailParams')

export const deleteKipiDetailQuerySchema = z
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
    .openapi('DeleteKipiDetailQuery')

export const updateKipiDetailSchema = createKipiDetailSchema
    .partial()
    .openapi('UpdateKipiDetailInput')

export type CreateKipiDetailInput = z.infer<typeof createKipiDetailSchema>
export type UpdateKipiDetailInput = z.infer<typeof updateKipiDetailSchema>
export type GetKipiDetailsQueryInput = z.infer<typeof getKipiDetailsQuerySchema>
export type KipiDetailParamInput = z.infer<typeof kipiDetailParamsSchema>
export type DeleteKipiDetailQueryInput = z.infer<
    typeof deleteKipiDetailQuerySchema
>
