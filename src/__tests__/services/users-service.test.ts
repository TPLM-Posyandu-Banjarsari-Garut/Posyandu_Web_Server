import { UserService } from '@/services/users-service'
import { UserRepository } from '@/repositories/user-repository'
import { AuthService } from '@/services/auth-service'
import { User } from '@/db'

jest.mock('@/configs/auth', () => ({ auth: {} }))
jest.mock('@/configs/db', () => ({ default: {} }))
jest.mock('@/services/auth-service', () => ({
    AuthService: jest.fn()
}))

describe('UserService Unit Tests', () => {
    let userService: UserService
    let mockUserRepository: jest.Mocked<UserRepository>
    let mockAuthService: jest.Mocked<AuthService>

    const mockUser: User = {
        id: 'user-123',
        name: 'Budi Santoso',
        email: 'budi.santoso@example.com',
        email_verified: false,
        phone_number: '081234567890',
        avatar_url: null,
        role: 'parent',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
    }

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks()

        mockUserRepository = {
            existsByEmail: jest.fn(),
            existsByPhoneNumber: jest.fn(),
            getUsers: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
            hardDelete: jest.fn(),
            restore: jest.fn()
        } as unknown as jest.Mocked<UserRepository>

        mockAuthService = {
            registerWithEmail: jest.fn()
        } as unknown as jest.Mocked<AuthService>

        // Setup the mock constructor to return our mock instance
        ;(AuthService as jest.Mock).mockImplementation(() => mockAuthService)

        userService = new UserService(mockUserRepository)
    })

    describe('createUser', () => {
        const createPayload = {
            name: 'Budi Santoso',
            email: 'budi.santoso@example.com',
            password: 'password123',
            phone_number: '081234567890',
            role: 'cadre' as const,
            status: 'active' as const
        }

        it('should successfully create a user', async () => {
            mockUserRepository.existsByEmail.mockResolvedValue(false)
            mockUserRepository.existsByPhoneNumber.mockResolvedValue(false)
            mockAuthService.registerWithEmail.mockResolvedValue(mockUser)

            const result = await userService.createUser(createPayload)

            expect(mockUserRepository.existsByEmail).toHaveBeenCalledWith(
                createPayload.email
            )
            expect(mockUserRepository.existsByPhoneNumber).toHaveBeenCalledWith(
                createPayload.phone_number
            )
            expect(mockAuthService.registerWithEmail).toHaveBeenCalledWith({
                email: createPayload.email,
                password: createPayload.password,
                name: createPayload.name,
                phone_number: createPayload.phone_number,
                avatar_url: undefined,
                role: createPayload.role
            })
            expect(result).toEqual(mockUser)
        })

        it('should throw an error if email already exists', async () => {
            mockUserRepository.existsByEmail.mockResolvedValue(true)

            await expect(userService.createUser(createPayload)).rejects.toThrow(
                'Email already registered'
            )
            expect(mockUserRepository.existsByPhoneNumber).toHaveBeenCalled() // Promise.all
            expect(mockAuthService.registerWithEmail).not.toHaveBeenCalled()
        })

        it('should throw an error if phone number already exists', async () => {
            mockUserRepository.existsByEmail.mockResolvedValue(false)
            mockUserRepository.existsByPhoneNumber.mockResolvedValue(true)

            await expect(userService.createUser(createPayload)).rejects.toThrow(
                'Phone number already registered'
            )
            expect(mockAuthService.registerWithEmail).not.toHaveBeenCalled()
        })
    })

    describe('getUsers', () => {
        it('should return a paginated list of users', async () => {
            const mockUsers = [mockUser]
            mockUserRepository.getUsers.mockResolvedValue({
                data: mockUsers,
                totalItems: 1
            })

            const result = await userService.getUsers({ page: 1, limit: 10 })

            expect(mockUserRepository.getUsers).toHaveBeenCalledWith({
                page: 1,
                limit: 10
            })
            expect(result).toEqual({
                data: mockUsers,
                meta: {
                    page: 1,
                    limit: 10,
                    total_items: 1,
                    total_pages: 1
                }
            })
        })
    })

    describe('getUserById', () => {
        it('should return a user by id', async () => {
            mockUserRepository.findById.mockResolvedValue(mockUser)

            const result = await userService.getUserById('user-123')

            expect(mockUserRepository.findById).toHaveBeenCalledWith('user-123')
            expect(result).toEqual(mockUser)
        })

        it('should throw an error if user not found', async () => {
            mockUserRepository.findById.mockResolvedValue(undefined)

            await expect(userService.getUserById('user-123')).rejects.toThrow(
                'User not found'
            )
        })
    })

    describe('updateUser', () => {
        it('should update a user and return the updated user', async () => {
            const updatePayload = { name: 'Updated Name' }
            mockUserRepository.findById.mockResolvedValue(mockUser)
            mockUserRepository.update.mockResolvedValue({
                ...mockUser,
                ...updatePayload
            })

            const result = await userService.updateUser(
                'user-123',
                updatePayload
            )

            expect(mockUserRepository.findById).toHaveBeenCalledWith('user-123')
            expect(mockUserRepository.update).toHaveBeenCalledWith(
                'user-123',
                updatePayload
            )
            expect(result).toEqual({ ...mockUser, ...updatePayload })
        })

        it('should throw an error if email is taken by another user', async () => {
            const updatePayload = { email: 'taken@example.com' }
            mockUserRepository.findById.mockResolvedValue(mockUser)
            mockUserRepository.existsByEmail.mockResolvedValue(true) // Email taken

            await expect(
                userService.updateUser('user-123', updatePayload)
            ).rejects.toThrow('Email already taken by another user')
        })
    })

    describe('deleteUser', () => {
        it('should soft delete a user', async () => {
            mockUserRepository.findById.mockResolvedValue(mockUser)
            mockUserRepository.softDelete.mockResolvedValue({
                ...mockUser,
                status: 'inactive' as const
            })

            const result = await userService.deleteUser('user-123', false)

            expect(mockUserRepository.softDelete).toHaveBeenCalledWith(
                'user-123'
            )
            expect(mockUserRepository.hardDelete).not.toHaveBeenCalled()
            expect(result).toEqual({ ...mockUser, status: 'inactive' as const })
        })

        it('should hard delete a user', async () => {
            mockUserRepository.findById.mockResolvedValue(mockUser)
            mockUserRepository.hardDelete.mockResolvedValue(mockUser)

            const result = await userService.deleteUser('user-123', true)

            expect(mockUserRepository.hardDelete).toHaveBeenCalledWith(
                'user-123'
            )
            expect(mockUserRepository.softDelete).not.toHaveBeenCalled()
            expect(result).toEqual(mockUser)
        })
    })

    describe('restoreUser', () => {
        it('should restore a user', async () => {
            mockUserRepository.restore.mockResolvedValue({
                ...mockUser,
                status: 'active' as const
            })

            const result = await userService.restoreUser('user-123')

            expect(mockUserRepository.restore).toHaveBeenCalledWith('user-123')
            expect(result).toEqual({ ...mockUser, status: 'active' as const })
        })

        it('should throw an error if restoration fails', async () => {
            mockUserRepository.restore.mockResolvedValue(undefined)

            await expect(userService.restoreUser('user-123')).rejects.toThrow(
                'Failed to restore user'
            )
        })
    })
})
