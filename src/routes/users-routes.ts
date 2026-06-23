import { verifyAuth } from '@/middlewares/verify-auth'
import { authorizeRoles } from '@/middlewares/authorize-role'
import { Router } from 'express'
import { UserController } from '@/controllers/users-controller'
import { UserService } from '@/services/users-service'
import { UserRepository } from '@/repositories/user-repository'
import { AsyncHandler } from '@/utils/async-handler'
import { validateRequest } from '@/middlewares/validate-request'
import {
    createUserSchema,
    updateUserSchema,
    getUsersQuerySchema,
    userParamsSchema,
    deleteUserQuerySchema
} from '@/validations/users-validation'
import db from '@/configs/db'
import { signupRateLimiter } from '@/middlewares/rate-limiter'

const router = Router()

const user_repository = new UserRepository(db)
const user_service = new UserService(user_repository)
const user_controller = new UserController(user_service)

router.post(
    '/',
    signupRateLimiter,
    verifyAuth,
    authorizeRoles('posyandu_admin', 'village_admin'),
    validateRequest({ body: createUserSchema }),
    AsyncHandler(user_controller.createUser)
)

router.get(
    '/',
    verifyAuth,
    authorizeRoles('posyandu_admin', 'village_admin', 'midwife', 'cadre'),
    validateRequest({ query: getUsersQuerySchema }),
    AsyncHandler(user_controller.getUsers)
)

router.get(
    '/:public_id',
    verifyAuth,
    authorizeRoles(
        'posyandu_admin',
        'village_admin',
        'midwife',
        'cadre',
        'parent'
    ),
    validateRequest({ params: userParamsSchema }),
    AsyncHandler(user_controller.getUserById)
)

router.put(
    '/:public_id',
    verifyAuth,
    authorizeRoles('posyandu_admin', 'village_admin'),
    validateRequest({ params: userParamsSchema, body: updateUserSchema }),
    AsyncHandler(user_controller.updateUser)
)

router.delete(
    '/:public_id',
    verifyAuth,
    authorizeRoles('posyandu_admin', 'village_admin'),
    validateRequest({ params: userParamsSchema, query: deleteUserQuerySchema }),
    AsyncHandler(user_controller.deleteUser)
)

router.post(
    '/:public_id/restore',
    verifyAuth,
    authorizeRoles('posyandu_admin', 'village_admin'),
    validateRequest({ params: userParamsSchema }),
    AsyncHandler(user_controller.restoreUser)
)

export default router
