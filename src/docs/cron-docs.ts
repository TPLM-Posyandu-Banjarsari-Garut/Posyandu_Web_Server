import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'

export const registerCronRoutes = (registry: OpenAPIRegistry) => {
    const TAG = ['Cron Jobs']

    registry.registerPath({
        method: 'post',
        path: '/api/cron/trigger',
        tags: TAG,
        summary:
            'Trigger scheduled cron jobs manually or via external scheduler',
        security: [{ BearerAuth: [] }],
        responses: {
            200: { description: 'Cron jobs executed successfully' },
            401: { description: 'Unauthorized' },
            500: { description: 'Cron execution failed' }
        }
    })
}
