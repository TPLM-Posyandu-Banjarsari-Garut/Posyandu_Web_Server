import { Request, Response } from 'express'
import { UserService } from '@/services/users-service'
import { UserQueryFilters } from '@/repositories/user-repository'
import { ApiResponse } from '@/utils/api-response'
import { logger } from '@/utils/logger'
import {
    handleDeleteRequest,
    handleGetByIdRequest,
    handleRestoreRequest
} from '@/utils/controller-handlers'
import {
    registerParentSchema,
    registerCadreSchema,
    registerMidwifeSchema
} from '@/validations/registration-validation'
import { ApiError } from '@/utils/api-error'
import { CreateUserInput } from '@/validations/users-validation'

export class UserController {
    constructor(private readonly user_service: UserService) {}

    createUser = async (req: Request, res: Response) => {
        logger.info({ body: req.body }, 'Incoming request: Create User')

        const { role } = req.body
        let validatedData
        if (role === 'parent') {
            validatedData = registerParentSchema.parse(req.body)
        } else if (role === 'cadre') {
            validatedData = registerCadreSchema.parse(req.body)
        } else if (role === 'midwife') {
            validatedData = registerMidwifeSchema.parse(req.body)
        } else {
            throw ApiError.badRequest(`Invalid role: ${role}`)
        }

        const user = await this.user_service.createUser(
            validatedData as CreateUserInput
        )

        logger.info({ userId: user.id }, 'User created successfully')
        return ApiResponse.created(res, 'User created successfully', user)
    }

    getUsers = async (req: Request, res: Response) => {
        const query = req.query as unknown as UserQueryFilters
        logger.info({ query }, 'Incoming request: Get Users')

        const result = await this.user_service.getUsers(query)
        return ApiResponse.ok(res, 'Users retrieved successfully', result)
    }

    getUserById = async (req: Request, res: Response) => {
        return handleGetByIdRequest(
            req,
            res,
            'User',
            this.user_service.getUserById.bind(this.user_service)
        )
    }

    updateUser = async (req: Request, res: Response) => {
        const public_id = req.params.public_id as string
        logger.info(
            { public_id, body: req.body },
            'Incoming request: Update User'
        )

        const user = await this.user_service.updateUser(public_id, req.body)
        return ApiResponse.ok(res, 'User updated successfully', user)
    }

    deleteUser = async (req: Request, res: Response) => {
        return handleDeleteRequest(
            req,
            res,
            'User',
            this.user_service.deleteUser.bind(this.user_service)
        )
    }

    restoreUser = async (req: Request, res: Response) => {
        return handleRestoreRequest(
            req,
            res,
            'User',
            this.user_service.restoreUser.bind(this.user_service)
        )
    }
}
