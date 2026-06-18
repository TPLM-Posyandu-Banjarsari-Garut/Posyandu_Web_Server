import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { paginationQuerySchema } from '@/validations/shared-validation'

export const registerNotificationsRoutes = (registry: OpenAPIRegistry) => {
    const TAG = ['Notifications']

    registry.registerPath({
        method: 'get',
        path: '/api/notifications',
        tags: TAG,
        summary: 'Get list of user notifications [Roles: authenticated]',
        request: {
            query: z.object({
                ...paginationQuerySchema,
                status: z.enum(['read', 'unread']).optional()
            })
        },
        responses: {
            200: { description: 'Success retrieve list of notifications' }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/api/notifications/unread-count',
        tags: TAG,
        summary: 'Get count of unread notifications [Roles: authenticated]',
        responses: {
            200: { description: 'Success retrieve unread count' }
        }
    })

    registry.registerPath({
        method: 'put',
        path: '/api/notifications/read-all',
        tags: TAG,
        summary: 'Mark all notifications as read [Roles: authenticated]',
        responses: {
            200: { description: 'Success mark all as read' }
        }
    })

    registry.registerPath({
        method: 'put',
        path: '/api/notifications/{id}/read',
        tags: TAG,
        summary: 'Mark a specific notification as read [Roles: authenticated]',
        request: {
            params: z.object({
                id: z.string().min(1, 'Notification ID is required')
            })
        },
        responses: {
            200: { description: 'Success mark notification as read' },
            404: { description: 'Notification not found' }
        }
    })
}
