import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import {
    createExaminationScheduleSchema,
    updateExaminationScheduleSchema,
    getExaminationSchedulesQuerySchema,
    examinationScheduleParamsSchema,
    deleteExaminationScheduleQuerySchema
} from '@/validations/examination-schedules-validation'

export const registerExaminationSchedulesRoutes = (
    registry: OpenAPIRegistry
) => {
    registry.register(
        'CreateExaminationScheduleInput',
        createExaminationScheduleSchema
    )
    registry.register(
        'UpdateExaminationScheduleInput',
        updateExaminationScheduleSchema
    )

    const TAG = ['Examination Schedules']

    registry.registerPath({
        method: 'post',
        path: '/api/examination-schedules',
        tags: TAG,
        summary:
            'Create a new examination schedule [Roles: admin, midwife, cadre]',
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: createExaminationScheduleSchema
                    }
                }
            }
        },
        responses: {
            201: { description: 'Examination schedule created successfully' },
            400: { description: 'Validation error' }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/api/examination-schedules',
        tags: TAG,
        summary:
            'Get list of examination schedules [Roles: admin, midwife, cadre, parent]',
        request: { query: getExaminationSchedulesQuerySchema },
        responses: {
            200: {
                description: 'Success retrieve list of examination schedules'
            }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/api/examination-schedules/{public_id}',
        tags: TAG,
        summary:
            'Get examination schedule by ID [Roles: admin, midwife, cadre, parent]',
        request: { params: examinationScheduleParamsSchema },
        responses: {
            200: { description: 'Success get examination schedule detail' },
            404: { description: 'Examination schedule not found' }
        }
    })

    registry.registerPath({
        method: 'put',
        path: '/api/examination-schedules/{public_id}',
        tags: TAG,
        summary: 'Update examination schedule [Roles: admin, midwife, cadre]',
        request: {
            params: examinationScheduleParamsSchema,
            body: {
                content: {
                    'application/json': {
                        schema: updateExaminationScheduleSchema
                    }
                }
            }
        },
        responses: {
            200: { description: 'Examination schedule updated successfully' },
            400: { description: 'Validation error' },
            404: { description: 'Examination schedule not found' }
        }
    })

    registry.registerPath({
        method: 'delete',
        path: '/api/examination-schedules/{public_id}',
        tags: TAG,
        summary: 'Delete examination schedule [Roles: admin, midwife, cadre]',
        request: {
            params: examinationScheduleParamsSchema,
            query: deleteExaminationScheduleQuerySchema
        },
        responses: {
            200: { description: 'Examination schedule deleted successfully' },
            404: { description: 'Examination schedule not found' }
        }
    })

    registry.registerPath({
        method: 'post',
        path: '/api/examination-schedules/{public_id}/restore',
        tags: TAG,
        summary:
            'Restore soft-deleted examination schedule [Roles: admin, midwife, cadre]',
        request: { params: examinationScheduleParamsSchema },
        responses: {
            200: { description: 'Examination schedule restored successfully' },
            404: { description: 'Examination schedule not found' }
        }
    })
}
