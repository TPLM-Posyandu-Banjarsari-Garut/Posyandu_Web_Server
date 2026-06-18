import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import {
    createUserSchema,
    updateUserSchema,
    getUsersQuerySchema,
    userParamsSchema,
    deleteUserQuerySchema
} from '@/validations/users-validation'

export const registerUsersRoutes = (registry: OpenAPIRegistry) => {
    registry.register('CreateUserInput', createUserSchema)
    registry.register('UpdateUserInput', updateUserSchema)

    const USER_TAG = ['Users']

    registry.registerPath({
        method: 'post',
        path: '/api/users',
        tags: USER_TAG,
        summary: 'Create a new user [Roles: admin]',
        request: {
            body: {
                content: { 'application/json': { schema: createUserSchema } }
            }
        },
        responses: {
            201: { description: 'User created successfully' },
            400: { description: 'Validation error' }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/api/users',
        tags: USER_TAG,
        summary: 'Get list of users [Roles: admin, midwife, cadre]',
        request: { query: getUsersQuerySchema },
        responses: {
            200: { description: 'Success get list of users' }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/api/users/{public_id}',
        tags: USER_TAG,
        summary: 'Get user by public ID [Roles: admin, midwife, cadre, parent]',
        request: { params: userParamsSchema },
        responses: {
            200: { description: 'Success get user detail' },
            404: { description: 'User not found' }
        }
    })

    registry.registerPath({
        method: 'put',
        path: '/api/users/{public_id}',
        tags: USER_TAG,
        summary: 'Update user data [Roles: admin]',
        request: {
            params: userParamsSchema,
            body: {
                content: { 'application/json': { schema: updateUserSchema } }
            }
        },
        responses: {
            200: { description: 'User updated successfully' },
            400: { description: 'Validation error' },
            404: { description: 'User not found' }
        }
    })

    registry.registerPath({
        method: 'delete',
        path: '/api/users/{public_id}',
        tags: USER_TAG,
        summary: 'Delete user [Roles: admin]',
        request: { params: userParamsSchema, query: deleteUserQuerySchema },
        responses: {
            200: { description: 'User deleted successfully' },
            404: { description: 'User not found' }
        }
    })

    registry.registerPath({
        method: 'post',
        path: '/api/users/{public_id}/restore',
        tags: USER_TAG,
        summary: 'Restore soft-deleted user [Roles: admin]',
        request: { params: userParamsSchema },
        responses: {
            200: { description: 'User restored successfully' },
            404: { description: 'User not found' }
        }
    })
}
