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
    userParamsSchema
} from '@/validations/users-validation'
import db from '@/configs/db'

const router = Router()

const user_repository = new UserRepository(db)
const user_service = new UserService(user_repository)
const user_controller = new UserController(user_service)

router.post(
    '/',
    validateRequest({ body: createUserSchema }),
    AsyncHandler(user_controller.createUser)
)

router.get(
    '/',
    validateRequest({ query: getUsersQuerySchema }),
    AsyncHandler(user_controller.getUsers)
)

router.get(
    '/:public_id',
    validateRequest({ params: userParamsSchema }),
    AsyncHandler(user_controller.getUserById)
)

router.put(
    '/:public_id',
    validateRequest({ params: userParamsSchema, body: updateUserSchema }),
    AsyncHandler(user_controller.updateUser)
)

router.delete(
    '/:public_id',
    validateRequest({ params: userParamsSchema }),
    AsyncHandler(user_controller.deleteUser)
)

router.post(
    '/:public_id/restore',
    validateRequest({ params: userParamsSchema }),
    AsyncHandler(user_controller.restoreUser)
)

export default router
