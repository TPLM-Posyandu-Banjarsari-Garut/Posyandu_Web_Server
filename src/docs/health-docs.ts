import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'

export const registerHealthRoutes = (registry: OpenAPIRegistry) => {
    const TAG = ['Health Check']

    registry.registerPath({
        method: 'get',
        path: '/api/health',
        tags: TAG,
        summary: 'Basic server health check',
        responses: {
            200: { description: 'Server is healthy and running' }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/api/health/detailed',
        tags: TAG,
        summary: 'Detailed system health metrics',
        responses: {
            200: { description: 'Detailed health specifications retrieved' }
        }
    })
}
