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
        requestBody: {
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            task: {
                                type: 'string',
                                description:
                                    'Specific task to trigger. Leave empty to run generic time-based cron tasks.',
                                enum: [
                                    'keep-alive',
                                    'reminder-2h',
                                    'reminder-h1',
                                    'auto-expire',
                                    'daily-cleanup',
                                    'follow-up'
                                ]
                            }
                        }
                    }
                }
            }
        },
        responses: {
            200: { description: 'Cron jobs executed successfully' },
            401: { description: 'Unauthorized' },
            500: { description: 'Cron execution failed' }
        }
    })
}
