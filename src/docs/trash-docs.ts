import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import {
    getTrashQuerySchema,
    restoreParamsSchema
} from '@/validations/trash-validation'

export const registerTrashRoutes = (registry: OpenAPIRegistry) => {
    const TRASH_TAG = ['Trash / Recycle Bin']

    registry.registerPath({
        method: 'get',
        path: '/api/trash',
        tags: TRASH_TAG,
        summary:
            'Get list of deleted/inactive items from trash bin [Roles: admin]',
        request: { query: getTrashQuerySchema },
        responses: {
            200: { description: 'Success get list of deleted items' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden' }
        }
    })

    registry.registerPath({
        method: 'post',
        path: '/api/trash/{type}/{public_id}/restore',
        tags: TRASH_TAG,
        summary:
            'Restore a deleted/inactive item from trash bin [Roles: admin]',
        request: { params: restoreParamsSchema },
        responses: {
            200: { description: 'Item restored successfully' },
            400: { description: 'Validation error' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden' },
            404: { description: 'Item not found' }
        }
    })
}
