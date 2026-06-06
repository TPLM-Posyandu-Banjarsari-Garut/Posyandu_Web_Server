import {
    OpenAPIRegistry,
    OpenApiGeneratorV3
} from '@asteasolutions/zod-to-openapi'
import { registerCadresRoutes } from '@/docs/cadres-docs'
import { registerHealthCentersRoutes } from '@/docs/health-centers-docs'
import { registerPosyandusRoutes } from '@/docs/posyandus-docs'
import { registerMidwifesRoutes } from '@/docs/midwifes-docs'

export const registry = new OpenAPIRegistry()

// health-facility
registerHealthCentersRoutes(registry)
registerPosyandusRoutes(registry)

// users
registerCadresRoutes(registry)
registerMidwifesRoutes(registry)

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
