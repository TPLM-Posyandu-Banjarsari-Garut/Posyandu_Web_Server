import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'

export const registerHealthRoutes = (registry: OpenAPIRegistry) => {
    const TAG = ['Health Check']

    registry.registerPath({
        method: 'get',
        path: '/api/health',
        tags: TAG,
        summary: 'Detailed server health metrics',
        security: [],
        responses: {
            200: { description: 'Detailed health metrics retrieved' }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/api/health/live',
        tags: TAG,
        summary: 'Check whether the server process is running',
        security: [],
        responses: {
            200: { description: 'Server is healthy and running' }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/api/health/ready',
        tags: TAG,
        summary: 'Check whether the server and database are ready',
        security: [],
        responses: {
            200: { description: 'Server and database are ready' },
            503: { description: 'Server is not ready' }
        }
    })
}
