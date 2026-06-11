import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const relationIdSchema = (fieldName: string) =>
    z
        .string()
        .min(1, `${fieldName} is required`)
        .openapi({ example: `${fieldName.toLowerCase()}-uuid` })

export const paginationQuerySchema = {
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

    order: z
        .enum(['asc', 'desc'])
        .optional()
        .default('desc')
        .openapi({
            type: 'string',
            enum: ['asc', 'desc'],
            default: 'desc',
            example: 'desc'
        })
}

export const deleteQuerySchema = z
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
    .openapi('DeleteQuery')
