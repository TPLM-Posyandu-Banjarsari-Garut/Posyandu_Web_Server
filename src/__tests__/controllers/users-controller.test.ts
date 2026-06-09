import { UserController } from '@/controllers/users-controller'
import { UserService } from '@/services/users-service'
import { Request, Response } from 'express'
import { ApiResponse } from '@/utils/api-response'
import { logger } from '@/utils/logger'
import { User } from '@/db'

jest.mock('@/utils/api-response', () => ({
    ApiResponse: {
        created: jest.fn(),
        ok: jest.fn()
    }
}))
jest.mock('@/utils/logger', () => ({
    logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
    }
}))

describe('UserController Unit Tests', () => {
    let userController: UserController
    let mockUserService: jest.Mocked<UserService>
    let mockReq: Partial<Request>
    let mockRes: Partial<Response>

    const mockUser = {
        id: 'user-123',
        name: 'Budi Santoso',
        email: 'budi.santoso@example.com',
        phone_number: '081234567890',
        role: 'parent',
        status: 'active'
    }

    beforeEach(() => {
        jest.clearAllMocks()

        mockUserService = {
            createUser: jest.fn(),
            getUsers: jest.fn(),
            getUserById: jest.fn(),
            updateUser: jest.fn(),
            deleteUser: jest.fn(),
            restoreUser: jest.fn()
        } as unknown as jest.Mocked<UserService>

        userController = new UserController(mockUserService)

        mockReq = {
            body: {},
            params: {},
            query: {}
        }

        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }
    })

    describe('createUser', () => {
        it('should create a user and return 201 Created', async () => {
            mockReq.body = {
                name: 'Budi Santoso',
                email: 'budi.santoso@example.com',
                password: 'password123'
            }

            mockUserService.createUser.mockResolvedValue(
                mockUser as unknown as User
            )

            await userController.createUser(
                mockReq as Request,
                mockRes as Response
            )

            expect(mockUserService.createUser).toHaveBeenCalledWith(
                mockReq.body
            )
            expect(ApiResponse.created).toHaveBeenCalledWith(
                mockRes,
                'User created successfully',
                mockUser
            )
            expect(logger.info).toHaveBeenCalled()
        })
    })

    describe('getUsers', () => {
        it('should retrieve users and return 200 OK', async () => {
            mockReq.query = { page: '1', limit: '10' }
            const mockResult = {
                data: [mockUser],
                meta: { page: 1, limit: 10, total_items: 1, total_pages: 1 }
            }

            mockUserService.getUsers.mockResolvedValue(
                mockResult as unknown as Awaited<
                    ReturnType<UserService['getUsers']>
                >
            )

            await userController.getUsers(
                mockReq as Request,
                mockRes as Response
            )

            expect(mockUserService.getUsers).toHaveBeenCalledWith(mockReq.query)
            expect(ApiResponse.ok).toHaveBeenCalledWith(
                mockRes,
                'Users retrieved successfully',
                mockResult
            )
        })
    })

    describe('getUserById', () => {
        it('should retrieve user by ID and return 200 OK', async () => {
            mockReq.params = { public_id: 'user-123' }

            mockUserService.getUserById.mockResolvedValue(
                mockUser as unknown as User
            )

            await userController.getUserById(
                mockReq as Request,
                mockRes as Response
            )

            expect(mockUserService.getUserById).toHaveBeenCalledWith('user-123')
            expect(ApiResponse.ok).toHaveBeenCalledWith(
                mockRes,
                'User retrieved successfully',
                mockUser
            )
        })
    })

    describe('updateUser', () => {
        it('should update user and return 200 OK', async () => {
            mockReq.params = { public_id: 'user-123' }
            mockReq.body = { name: 'Updated Name' }

            const updatedUser = { ...mockUser, ...mockReq.body }
            mockUserService.updateUser.mockResolvedValue(
                updatedUser as unknown as User
            )

            await userController.updateUser(
                mockReq as Request,
                mockRes as Response
            )

            expect(mockUserService.updateUser).toHaveBeenCalledWith(
                'user-123',
                mockReq.body
            )
            expect(ApiResponse.ok).toHaveBeenCalledWith(
                mockRes,
                'User updated successfully',
                updatedUser
            )
        })
    })

    describe('deleteUser', () => {
        it('should soft delete user and return 200 OK', async () => {
            mockReq.params = { public_id: 'user-123' }
            mockReq.query = { permanent: 'false' }

            const deletedUser = { ...mockUser, status: 'inactive' }
            mockUserService.deleteUser.mockResolvedValue(
                deletedUser as unknown as User
            )

            await userController.deleteUser(
                mockReq as Request,
                mockRes as Response
            )

            expect(mockUserService.deleteUser).toHaveBeenCalledWith(
                'user-123',
                false
            )
            expect(ApiResponse.ok).toHaveBeenCalledWith(
                mockRes,
                'User deleted successfully',
                deletedUser
            )
        })

        it('should hard delete user when permanent=true', async () => {
            mockReq.params = { public_id: 'user-123' }
            mockReq.query = { permanent: 'true' }

            mockUserService.deleteUser.mockResolvedValue(
                mockUser as unknown as User
            )

            await userController.deleteUser(
                mockReq as Request,
                mockRes as Response
            )

            expect(mockUserService.deleteUser).toHaveBeenCalledWith(
                'user-123',
                true
            )
        })
    })

    describe('restoreUser', () => {
        it('should restore user and return 200 OK', async () => {
            mockReq.params = { public_id: 'user-123' }

            const restoredUser = { ...mockUser, status: 'active' }
            mockUserService.restoreUser.mockResolvedValue(
                restoredUser as unknown as User
            )

            await userController.restoreUser(
                mockReq as Request,
                mockRes as Response
            )

            expect(mockUserService.restoreUser).toHaveBeenCalledWith('user-123')
            expect(ApiResponse.ok).toHaveBeenCalledWith(
                mockRes,
                'User restored successfully',
                restoredUser
            )
        })
    })
})
