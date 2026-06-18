import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import {
    getMediasQuerySchema,
    mediaIdParamSchema
} from '@/validations/medias-validation'
import { deleteQuerySchema } from '@/validations/shared-validation'

export const registerMediasRoutes = (registry: OpenAPIRegistry) => {
    const MEDIAS_TAG = ['Medias']

    registry.registerPath({
        method: 'post',
        path: '/api/medias/upload',
        tags: MEDIAS_TAG,
        summary: 'Upload media files (Bulk max 5 files) [Roles: authenticated]',
        request: {
            body: {
                content: {
                    'multipart/form-data': {
                        schema: z.object({
                            files: z
                                .array(
                                    z.string().openapi({
                                        type: 'string',
                                        format: 'binary'
                                    })
                                )
                                .openapi({
                                    description:
                                        'Up to 5 files (images, video, excel, docs)'
                                })
                        })
                    }
                }
            }
        },
        responses: {
            201: { description: 'Media files uploaded successfully' },
            400: { description: 'Validation error / Size limit exceeded' }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/api/medias',
        tags: MEDIAS_TAG,
        summary: 'Get list of uploaded media [Roles: authenticated]',
        request: { query: getMediasQuerySchema },
        responses: {
            200: { description: 'Success get list of media' }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/api/medias/{id}',
        tags: MEDIAS_TAG,
        summary: 'Get media detail by ID [Roles: authenticated]',
        request: { params: mediaIdParamSchema },
        responses: {
            200: { description: 'Success get media detail' },
            404: { description: 'Media not found' }
        }
    })

    registry.registerPath({
        method: 'delete',
        path: '/api/medias/{id}',
        tags: MEDIAS_TAG,
        summary: 'Delete media [Roles: authenticated]',
        request: { params: mediaIdParamSchema, query: deleteQuerySchema },
        responses: {
            200: { description: 'Media deleted successfully' },
            404: { description: 'Media not found' }
        }
    })
}
