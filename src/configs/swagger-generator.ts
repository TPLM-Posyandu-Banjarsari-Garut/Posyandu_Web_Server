import {
    OpenAPIRegistry,
    OpenApiGeneratorV3
} from '@asteasolutions/zod-to-openapi'
import { registerCadresRoutes } from '@/docs/cadres-docs'

export const registry = new OpenAPIRegistry()

registerCadresRoutes(registry)

export function generateOpenApiDocs() {
    const generator = new OpenApiGeneratorV3(registry.definitions)
    return generator.generateDocument({
        openapi: '3.0.0',
        info: {
            title: 'Posyandu Core API',
            version: '1.0.0',
            description:
                'API documentation generated automatically from Zod Schema.'
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development Server'
            }
        ]
    })
}
