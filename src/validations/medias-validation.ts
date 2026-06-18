import { z } from 'zod'
import { paginationQuerySchema } from './shared-validation'

export const getMediasQuerySchema = z.object({
    ...paginationQuerySchema,
    search: z.string().optional().openapi({ example: 'photo' }),
    file_category: z
        .enum(['image', 'video', 'excel', 'docs'])
        .optional()
        .openapi({ example: 'image' }),
    uploaded_by: z.string().optional().openapi({ example: 'user-uuid' })
})

export const mediaIdParamSchema = z.object({
    id: z.string().min(1, 'ID is required').openapi({ example: 'media-uuid' })
})
