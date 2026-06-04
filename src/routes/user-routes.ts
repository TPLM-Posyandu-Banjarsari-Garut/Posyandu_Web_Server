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
    '/',
    validateRequest(createUserSchema, 'body'),
    AsyncHandler(user_controller.createUser)
)

router.get('/', AsyncHandler(user_controller.getUsers))

router.get('/search', AsyncHandler(user_controller.getUsers))

router.get(
    '/:public_id',
    validateRequest(userParamsSchema, 'params'),
    AsyncHandler(user_controller.getUserById)
)

router.put(
    '/:public_id',
    validateRequest(userParamsSchema, 'params'),
    validateRequest(updateUserSchema, 'body'),
    AsyncHandler(user_controller.updateUser)
)

router.delete(
    '/:public_id',
    validateRequest(userParamsSchema, 'params'),
    AsyncHandler(user_controller.deleteUser)
)

export default router
