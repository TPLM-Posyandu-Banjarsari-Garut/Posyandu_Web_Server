import { Request, Response } from 'express'
import { UserService } from '@/services/user-service'
import { UserQueryFilters } from '@/repositories/user-repository'
import { ApiResponse } from '@/utils/api-response'
import { logger } from '@/utils/logger'

export class UserController {
    constructor(private readonly user_service: UserService) {}

    createUser = async (req: Request, res: Response) => {
        logger.info({ body: req.body }, 'Incoming request: Create User')

        const user = await this.user_service.createUser(req.body)

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
        const public_id = req.params.public_id as string
        logger.info({ public_id }, 'Incoming request: Get User By ID')

        const user = await this.user_service.getUserById(public_id)
        return ApiResponse.ok(res, 'User retrieved successfully', user)
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
        const public_id = req.params.public_id as string
        const is_permanent = req.query.permanent === 'true'
        logger.warn(
            { public_id, is_permanent },
            'Incoming request: Delete User'
        )

        const user = await this.user_service.deleteUser(public_id, is_permanent)
        return ApiResponse.ok(res, 'User deleted successfully', user)
    }

    restoreUser = async (req: Request, res: Response) => {
        const public_id = req.params.public_id as string
        logger.info({ public_id }, 'Incoming request: Restore User')

        const user = await this.user_service.restoreUser(public_id)
        return ApiResponse.ok(res, 'User restored successfully', user)
    }
}
