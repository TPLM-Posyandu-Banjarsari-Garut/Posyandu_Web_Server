import { accountStatusEnum, cadrePositionEnum, cadres } from '@/db'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import {
    relationIdSchema,
    paginationQuerySchema,
    deleteQuerySchema
} from './shared-validation'

extendZodWithOpenApi(z)

export const createCadreSchema = createInsertSchema(cadres, {
    user_id: relationIdSchema('User ID'),

    posyandu_id: relationIdSchema('Posyandu ID'),

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
        ...paginationQuerySchema,

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

export const deleteCadreQuerySchema = deleteQuerySchema

export const updateCadreSchema = createCadreSchema
    .partial()
    .openapi('UpdateCadreInput')

export type CreateCadreInput = z.infer<typeof createCadreSchema>
export type UpdateCadreInput = z.infer<typeof updateCadreSchema>
export type GetCadresQueryInput = z.infer<typeof getCadresQuerySchema>
export type CadreParamInput = z.infer<typeof cadreParamsSchema>
export type DeleteCadreQueryInput = z.infer<typeof deleteCadreQuerySchema>
