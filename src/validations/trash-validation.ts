import { z } from 'zod'
import { paginationQuerySchema } from './shared-validation'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const trashTypes = [
    'user',
    'children',
    'posyandu',
    'education',
    'education_category',
    'vaccine',
    'vitamin',
    'pregnancy_record',
    'nutrition_record',
    'vitamin_record',
    'immunization_record',
    'kipi_detail',
    'examination_schedule',
    'examination_record',
    'examination',
    'inventory'
] as const

export const trashTypeEnum = z.enum(trashTypes)

export const getTrashQuerySchema = z
    .object({
        ...paginationQuerySchema,
        type: trashTypeEnum.optional().openapi({
            description: 'Filter trash items by table/type',
            example: 'user'
        }),
        search: z.string().optional().openapi({
            description: 'Search trash items by name/attributes',
            example: 'John Doe'
        })
    })
    .openapi('GetTrashQuery')

export const restoreParamsSchema = z
    .object({
        type: trashTypeEnum.openapi({
            description: 'The type of the resource to restore',
            example: 'user'
        }),
        public_id: z.string().min(1, 'Public ID is required').openapi({
            description: 'The unique public ID of the resource to restore',
            example: 'usr-123456'
        })
    })
    .openapi('RestoreParams')

export type GetTrashQueryInput = z.infer<typeof getTrashQuerySchema>
export type RestoreParamsInput = z.infer<typeof restoreParamsSchema>
