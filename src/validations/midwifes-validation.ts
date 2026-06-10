import { accountStatusEnum, midwifes } from '@/db'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const createMidwifeSchema = createInsertSchema(midwifes, {
    user_id: z
        .string()
        .min(1, 'User ID is required')
        .openapi({ example: 'user-id-uuid' }),

    posyandu_id: z
        .string()
        .min(1, 'Posyandu ID is required')
        .openapi({ example: 'posyandu-id-uuid' }),

    identity_number: z
        .string()
        .max(16, 'Identity number (NIK) cannot exceed 16 characters')
        .optional()
        .nullable()
        .openapi({ example: '320101XXXXXXXXXX' }),

    license_number: z
        .string()
        .max(50, 'STR number cannot exceed 50 characters')
        .optional()
        .nullable()
        .openapi({ example: '1203521209876543' }),

    status: z.enum(accountStatusEnum.enumValues).default('active')
})
    .omit({
        id: true,
        created_at: true,
        updated_at: true,
        deleted_at: true
    })
    .openapi('CreateMidwifeInput')

export const getMidwifesQuerySchema = z
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

        user_id: z.string().optional().openapi({ example: 'user-id-uuid' }),

        health_center_id: z
            .string()
            .optional()
            .openapi({ example: 'health-center-id-uuid' }),

        status: z.enum(accountStatusEnum.enumValues).optional(),
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
    .openapi('GetMidwifeQuery')

export const midwifeParamsSchema = z
    .object({
        public_id: z
            .string()
            .min(1, 'Public ID is required')
            .openapi({ example: 'midwife-xyz-123' })
    })
    .openapi('MidwifeParams')

export const deleteMidwifeQuerySchema = z
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
    .openapi('DeleteMidwifeQuery')

export const updateMidwifeSchema = createMidwifeSchema
    .partial()
    .openapi('UpdateMidwifeInput')

export type CreateMidwifeInput = z.infer<typeof createMidwifeSchema>
export type UpdateMidwifeInput = z.infer<typeof updateMidwifeSchema>
export type GetMidwifeQueryInput = z.infer<typeof getMidwifesQuerySchema>
export type MidwifeParamInput = z.infer<typeof midwifeParamsSchema>
export type DeleteMidwifeQueryInput = z.infer<typeof deleteMidwifeQuerySchema>
