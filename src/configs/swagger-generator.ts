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
import { registerVitaminsRoutes } from '@/docs/vitamins-docs'
import { registerImmunizationRecordsRoutes } from '@/docs/immunization-records-docs'
import { registerVitaminRecordsRoutes } from '@/docs/vitamin-records-docs'
import { registerVaccinesRoutes } from '@/docs/vaccines-docs'
import { registerKipiDetailsRoutes } from '@/docs/kipi-details-docs'
import { registerNutritionRecordsRoutes } from '@/docs/nutrition-records-docs'
import { registerInventoriesRoutes } from '@/docs/inventories-docs'
import { registerEducationCategoriesRoutes } from '@/docs/education-categories-docs'
import { registerEducationsRoutes } from '@/docs/educations-docs'

import { registerAuthRoutes } from '@/docs/auth-docs'
import env from '@/configs/env'

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
registerVitaminsRoutes(registry)
registerImmunizationRecordsRoutes(registry)
registerVitaminRecordsRoutes(registry)
registerVaccinesRoutes(registry)
registerKipiDetailsRoutes(registry)
registerNutritionRecordsRoutes(registry)
registerInventoriesRoutes(registry)

// education
registerEducationCategoriesRoutes(registry)
registerEducationsRoutes(registry)

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
                url: env.CORS_ORIGIN,
                description: 'Development Server'
            }
        ],
        security: [{ BearerAuth: [] }]
    })
}
