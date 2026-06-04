import { Request, Response, NextFunction } from 'express'
import { UserService } from '@/services/user-service'
import { UserQueryFilters } from '@/repositories/user-repository'
import { ApiResponse } from '@/utils/api-response'
import { logger } from '@/utils/logger'

export class UserController {
    constructor(private readonly user_service: UserService) {}

    createUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            logger.info({ body: req.body }, 'Incoming request: Create User')

            const new_user = await this.user_service.createUser(req.body)

            logger.info({ userId: new_user.id }, 'User created successfully')

            return ApiResponse.created(
                res,
                'User created successfully',
                new_user
            )
        } catch (error) {
            return next(error)
        }
    }

    getUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const query_filters = req.query as unknown as UserQueryFilters
            logger.info(
                { filters: query_filters },
                'Incoming request: Get Users List'
            )

            const result = await this.user_service.getUsers(query_filters)

            logger.info('Users list retrieved successfully')

            return ApiResponse.paginated(
                res,
                result.data,
                result.meta,
                'Users retrieved successfully'
            )
        } catch (error) {
            return next(error)
        }
    }

    getUserById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const public_id = req.params.public_id as string
            logger.info({ public_id }, 'Incoming request: Get User By ID')

            const user = await this.user_service.getUserById(public_id)

            logger.info({ public_id }, 'User details retrieved successfully')

            return ApiResponse.ok(res, 'User retrieved successfully', user)
        } catch (error) {
            return next(error)
        }
    }

    updateUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const public_id = req.params.public_id as string
            logger.info(
                { public_id, body: req.body },
                'Incoming request: Update User'
            )

            const updated_user = await this.user_service.updateUser(
                public_id,
                req.body
            )

            logger.info({ public_id }, 'User updated successfully')

            return ApiResponse.ok(
                res,
                'User updated successfully',
                updated_user
            )
        } catch (error) {
            return next(error)
        }
    }

    deleteUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const public_id = req.params.public_id as string
            logger.warn({ public_id }, 'Incoming request: Delete User')

            const deleted_user = await this.user_service.deleteUser(public_id)

            logger.info({ public_id }, 'User deleted successfully')

            return ApiResponse.ok(
                res,
                'User deleted successfully',
                deleted_user
            )
        } catch (error) {
            return next(error)
        }
    }
}
