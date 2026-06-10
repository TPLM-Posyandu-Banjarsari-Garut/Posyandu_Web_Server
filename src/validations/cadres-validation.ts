import { accountStatusEnum, cadrePositionEnum, cadres } from '@/db'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const createCadreSchema = createInsertSchema(cadres, {
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

    position: z.enum(cadrePositionEnum.enumValues).default('member'),

    is_primary_assignment: z.boolean().default(true),

    duty_area_notes: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: 'RW 04' }),

    status: z.enum(accountStatusEnum.enumValues).default('active')
})
    .omit({
        id: true,
        created_at: true,
        updated_at: true,
        deleted_at: true
    })
    .openapi('CreateCadreInput')

export const getCadresQuerySchema = z
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

        posyandu_id: z
            .string()
            .optional()
            .openapi({ example: 'posyandu-id-uuid' }),

        position: z.enum(cadrePositionEnum.enumValues).optional(),
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
    .openapi('GetCadresQuery')

export const cadreParamsSchema = z
    .object({
        public_id: z
            .string()
            .min(1, 'Public ID is required')
            .openapi({ example: 'cadre-xyz-123' })
    })
    .openapi('CadreParams')

export const deleteCadreQuerySchema = z
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
    .openapi('DeleteCadreQuery')

export const updateCadreSchema = createCadreSchema
    .partial()
    .openapi('UpdateCadreInput')

export type CreateCadreInput = z.infer<typeof createCadreSchema>
export type UpdateCadreInput = z.infer<typeof updateCadreSchema>
export type GetCadresQueryInput = z.infer<typeof getCadresQuerySchema>
export type CadreParamInput = z.infer<typeof cadreParamsSchema>
export type DeleteCadreQueryInput = z.infer<typeof deleteCadreQuerySchema>
