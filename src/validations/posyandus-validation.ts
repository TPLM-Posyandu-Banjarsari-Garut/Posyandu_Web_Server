import { accountStatusEnum, posyandus } from '@/db'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import {
    relationIdSchema,
    paginationQuerySchema,
    deleteQuerySchema
} from './shared-validation'

extendZodWithOpenApi(z)

export const createPosyanduSchema = createInsertSchema(posyandus, {
    name: z
        .string()
        .min(3, 'Posyandu name must be at least 3 characters')
        .max(100, 'Posyandu name cannot exceed 100 characters')
        .openapi({ example: 'Posyandu Melati 1' }),

    address_line: z
        .string()
        .min(5, 'Address must be at least 5 characters')
        .optional()
        .nullable()
        .openapi({ example: 'Jl. Mawar No. 12' }),

    rt: z
        .string()
        .max(5, 'RT cannot exceed 5 characters')
        .optional()
        .nullable()
        .openapi({ example: '003' }),

    rw: z
        .string()
        .max(5, 'RW cannot exceed 5 characters')
        .optional()
        .nullable()
        .openapi({ example: '005' }),

    village_name: z
        .string()
        .max(100, 'Village name cannot exceed 100 characters')
        .optional()
        .nullable()
        .openapi({ example: 'Sukajaya' }),

    contact_number: z
        .string()
        .max(20, 'Contact number cannot exceed 20 characters')
        .optional()
        .nullable()
        .openapi({ example: '081234567890' }),

    status: z.enum(accountStatusEnum.enumValues).default('active')
})
    .omit({
        id: true,
        created_at: true,
        updated_at: true,
        deleted_at: true
    })
    .openapi('CreatePosyanduInput')

export const getPosyandusQuerySchema = z
    .object({
        ...paginationQuerySchema,

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
    .openapi('GetPosyandusQuery')

export const posyanduParamsSchema = z
    .object({
        public_id: z
            .string()
            .min(1, 'Public ID is required')
            .openapi({ example: 'posyandu-xyz-123' })
    })
    .openapi('PosyanduParams')

export const deletePosyanduQuerySchema = deleteQuerySchema

export const updatePosyanduSchema = createPosyanduSchema
    .partial()
    .openapi('UpdatePosyanduInput')

export type CreatePosyanduInput = z.infer<typeof createPosyanduSchema>
export type UpdatePosyanduInput = z.infer<typeof updatePosyanduSchema>
export type GetPosyandusQueryInput = z.infer<typeof getPosyandusQuerySchema>
export type PosyanduParamInput = z.infer<typeof posyanduParamsSchema>
export type DeletePosyanduQueryInput = z.infer<typeof deletePosyanduQuerySchema>
