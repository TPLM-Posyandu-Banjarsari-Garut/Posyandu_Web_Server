import {
    OpenAPIRegistry,
    OpenApiGeneratorV3
} from '@asteasolutions/zod-to-openapi'
import { registerAuthRoutes } from '../auth-docs'
import { registerCadresRoutes } from '../cadres-docs'
import { registerChildrenRoutes } from '../childrens-docs'
import { registerConsultationsRoutes } from '../consultations-docs'
import { registerCronRoutes } from '../cron-docs'
import { registerEducationCategoriesRoutes } from '../education-categories-docs'
import { registerEducationsRoutes } from '../educations-docs'
import { registerExaminationRecordsRoutes } from '../examination-records-docs'
import { registerExaminationSchedulesRoutes } from '../examination-schedules-docs'
import { registerExaminationsRoutes } from '../examinations-docs'
import { registerHealthRoutes } from '../health-docs'
import { registerImmunizationRecordsRoutes } from '../immunization-records-docs'
import { registerInventoriesRoutes } from '../inventories-docs'
import { registerKipiDetailsRoutes } from '../kipi-details-docs'
import { registerMediasRoutes } from '../medias-docs'
import { registerMidwifesRoutes } from '../midwifes-docs'
import { registerNotificationsRoutes } from '../notifications-docs'
import { registerNutritionRecordsRoutes } from '../nutrition-records-docs'
import { registerParentsRoutes } from '../parents-docs'
import { registerPosyandusRoutes } from '../posyandus-docs'
import { registerPregnancyRecordsRoutes } from '../pregnancy-records-docs'
import { registerPushSubscriptionsRoutes } from '../push-subscriptions-docs'
import { registerTrashRoutes } from '../trash-docs'
import { registerUsersRoutes } from '../users-docs'
import { registerVaccinesRoutes } from '../vaccines-docs'
import { registerVitaminRecordsRoutes } from '../vitamin-records-docs'
import { registerVitaminsRoutes } from '../vitamins-docs'

const routeRegistrars = [
    registerAuthRoutes,
    registerTrashRoutes,
    registerUsersRoutes,
    registerParentsRoutes,
    registerCadresRoutes,
    registerMidwifesRoutes,
    registerPosyandusRoutes,
    registerChildrenRoutes,
    registerVitaminsRoutes,
    registerImmunizationRecordsRoutes,
    registerVitaminRecordsRoutes,
    registerVaccinesRoutes,
    registerKipiDetailsRoutes,
    registerNutritionRecordsRoutes,
    registerInventoriesRoutes,
    registerEducationCategoriesRoutes,
    registerEducationsRoutes,
    registerConsultationsRoutes,
    registerMediasRoutes,
    registerNotificationsRoutes,
    registerHealthRoutes,
    registerCronRoutes,
    registerPregnancyRecordsRoutes,
    registerExaminationsRoutes,
    registerExaminationSchedulesRoutes,
    registerExaminationRecordsRoutes,
    registerPushSubscriptionsRoutes
]

describe('Swagger route registrars', () => {
    it('generates the API paths registered by every documentation module', () => {
        const registry = new OpenAPIRegistry()
        registry.registerComponent('securitySchemes', 'BearerAuth', {
            type: 'http',
            scheme: 'bearer'
        })

        for (const registerRoutes of routeRegistrars) {
            registerRoutes(registry)
        }

        const document = new OpenApiGeneratorV3(
            registry.definitions
        ).generateDocument({
            openapi: '3.0.0',
            info: { title: 'Test API', version: '1.0.0' }
        })

        expect(Object.keys(document.paths)).toHaveLength(92)
        expect(
            document.paths['/api/push-subscriptions/subscribe']?.post
        ).toBeDefined()
        expect(
            document.paths[
                '/api/consultations/{public_id}/broadcast-notification'
            ]?.post
        ).toBeDefined()
        expect(document.paths['/api/health/live']?.get?.security).toEqual([])
    })
})
