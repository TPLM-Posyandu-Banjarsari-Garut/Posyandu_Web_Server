import { Router } from 'express'
import { UserController } from '@/controllers/user-controller'
import { UserService } from '@/services/user-service'
import { UserRepository } from '@/repositories/user-repository'
import { AsyncHandler } from '@/utils/async-handler'
import { validateRequest } from '@/middlewares/validate-request'
import {
    createUserSchema,
    updateUserSchema,
    getUsersQuerySchema,
    userParamsSchema
} from '@/validations/user-validation'
import db from '@/configs/db'

const router = Router()

const user_repository = new UserRepository(db)
const user_service = new UserService(user_repository)
const user_controller = new UserController(user_service)

router.post(
    '/users',
    validateRequest(createUserSchema, 'body'),
    AsyncHandler(user_controller.createUser)
)

router.get(
    '/users',
    validateRequest(getUsersQuerySchema, 'query'),
    AsyncHandler(user_controller.getUsers)
)

router.get(
    '/users/:public_id',
    validateRequest(userParamsSchema, 'params'),
    AsyncHandler(user_controller.getUserById)
)

router.put(
    '/users/:public_id',
    validateRequest(userParamsSchema, 'params'),
    validateRequest(updateUserSchema, 'body'),
    AsyncHandler(user_controller.updateUser)
)

router.delete(
    '/users/:public_id',
    validateRequest(userParamsSchema, 'params'),
    AsyncHandler(user_controller.deleteUser)
)

export default router
