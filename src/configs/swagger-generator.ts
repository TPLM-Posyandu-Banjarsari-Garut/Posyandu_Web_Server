import {
    OpenAPIRegistry,
    OpenApiGeneratorV3
} from '@asteasolutions/zod-to-openapi'
import { registerCadresRoutes } from '@/docs/cadres-docs'
import { registerHealthCentersRoutes } from '@/docs/health-centers-docs'
import { registerPosyandusRoutes } from '@/docs/posyandus-docs'
import { registerMidwifesRoutes } from '@/docs/midwifes-docs'
import { registerUsersRoutes } from '@/docs/users-docs'
import { registerParentsRoutes } from '@/docs/parents-docs'
import { registerChildrenRoutes } from '@/docs/childrens-docs'

import { registerAuthRoutes } from '@/docs/auth-docs'

export const registry = new OpenAPIRegistry()

registry.registerComponent('securitySchemes', 'BearerAuth', {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    in: 'header',
    name: 'Authorization'
})

// auth (Better Auth)
registerAuthRoutes(registry)

// users
registerUsersRoutes(registry)
registerParentsRoutes(registry)
registerCadresRoutes(registry)
registerMidwifesRoutes(registry)

// health-facility
registerHealthCentersRoutes(registry)
registerPosyandusRoutes(registry)

// children
registerChildrenRoutes(registry)

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
