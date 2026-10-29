import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import {
    subscribePushSchema,
    unsubscribePushSchema
} from '@/validations/push-subscriptions-validation'

export const registerPushSubscriptionsRoutes = (registry: OpenAPIRegistry) => {
    registry.register('SubscribePushInput', subscribePushSchema)
    registry.register('UnsubscribePushInput', unsubscribePushSchema)

    const TAG = ['Push Subscriptions']

    registry.registerPath({
        method: 'get',
        path: '/api/push-subscriptions/public-key',
        tags: TAG,
        summary: 'Get the public VAPID key for push notifications',
        security: [],
        responses: {
            200: { description: 'Public VAPID key retrieved successfully' }
        }
    })

    registry.registerPath({
        method: 'post',
        path: '/api/push-subscriptions/subscribe',
        tags: TAG,
        summary: 'Save the authenticated user push subscription',
        request: {
            body: {
                content: {
                    'application/json': { schema: subscribePushSchema }
                }
            }
        },
        responses: {
            201: { description: 'Push subscription saved successfully' },
            400: { description: 'Invalid push subscription data' },
            401: { description: 'Unauthorized' }
        }
    })

    registry.registerPath({
        method: 'delete',
        path: '/api/push-subscriptions/unsubscribe',
        tags: TAG,
        summary: 'Remove a push subscription for the authenticated user',
        request: {
            body: {
                content: {
                    'application/json': { schema: unsubscribePushSchema }
                }
            }
        },
        responses: {
            200: { description: 'Push subscription removed successfully' },
            400: { description: 'Invalid push subscription endpoint' },
            401: { description: 'Unauthorized' }
        }
    })
}
