import { UserRepository } from '@/repositories/user-repository'
import { users, NewUser } from '@/db'

describe('UserRepository CRUD Unit Tests', () => {
    let userRepository: UserRepository
    let mockDb: Record<string, jest.Mock>

    const mockUser = {
        id: 'user-123',
        name: 'Budi Santoso',
        email: 'budi.santoso@example.com',
        emailVerified: false,
        phone_number: '081234567890',
        avatar_url: null,
        role: 'parent',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
    }

    beforeEach(() => {
        // Mock chain methods of Drizzle ORM
        mockDb = {
            insert: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
            delete: jest.fn().mockReturnThis(),
            from: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            offset: jest.fn().mockReturnThis(),
            values: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis(),
            returning: jest.fn()
        }
        userRepository = new UserRepository(
            mockDb as unknown as ConstructorParameters<typeof UserRepository>[0]
        )
    })

    describe('create', () => {
        it('should insert and return the newly created user', async () => {
            mockDb.returning.mockResolvedValue([mockUser])

            const newUser: NewUser = {
                id: 'user-123',
                name: 'Budi Santoso',
                email: 'budi.santoso@example.com'
            }

            const result = await userRepository.create(newUser)

            expect(mockDb.insert).toHaveBeenCalledWith(users)
            expect(mockDb.values).toHaveBeenCalledWith(newUser)
            expect(result).toEqual(mockUser)
        })
    })

    describe('findById', () => {
        it('should return a user by id if status is active', async () => {
            mockDb.limit.mockResolvedValue([mockUser])

            const result = await userRepository.findById('user-123')

            expect(mockDb.select).toHaveBeenCalled()
            expect(mockDb.from).toHaveBeenCalledWith(users)
            expect(mockDb.limit).toHaveBeenCalledWith(1)
            expect(result).toEqual(mockUser)
        })

        it('should return undefined if user not found', async () => {
            mockDb.limit.mockResolvedValue([])

            const result = await userRepository.findById('non-existent')

            expect(result).toBeUndefined()
        })
    })

    describe('update', () => {
        it('should update user fields and return the updated user', async () => {
            const updatedUser = { ...mockUser, name: 'Budi Santoso Updated' }
            mockDb.returning.mockResolvedValue([updatedUser])

            const result = await userRepository.update('user-123', {
                name: 'Budi Santoso Updated'
            })

            expect(mockDb.update).toHaveBeenCalledWith(users)
            expect(mockDb.set).toHaveBeenCalledWith({
                name: 'Budi Santoso Updated'
            })
            expect(result).toEqual(updatedUser)
        })
    })

    describe('softDelete', () => {
        it('should update user status to inactive', async () => {
            const deletedUser = { ...mockUser, status: 'inactive' as const }
            mockDb.returning.mockResolvedValue([deletedUser])

            const result = await userRepository.softDelete('user-123')

            expect(mockDb.update).toHaveBeenCalledWith(users)
            expect(mockDb.set).toHaveBeenCalledWith({ status: 'inactive' })
            expect(result).toEqual(deletedUser)
        })
    })

    describe('hardDelete', () => {
        it('should permanently delete user from db', async () => {
            mockDb.returning.mockResolvedValue([mockUser])

            const result = await userRepository.hardDelete('user-123')

            expect(mockDb.delete).toHaveBeenCalledWith(users)
            expect(result).toEqual(mockUser)
        })
    })
})
