import { ParentRepository } from '@/repositories/parents-repository'
import { parents, NewParent, Parent } from '@/db'

describe('ParentRepository CRUD Unit Tests', () => {
    let parentRepository: ParentRepository
    let mockDb: Record<string, jest.Mock>

    const mockParent: Parent = {
        id: 'parent-123',
        user_id: 'user-123',
        identity_number: '1234567890123456',
        place_of_birth: 'Jakarta',
        date_of_birth: new Date('1990-01-01'),
        blood_type: 'A',
        education: 'S1',
        occupation: 'Pegawai Swasta',
        address_line: 'Jl. Contoh No. 123',
        rt: '001',
        rw: '002',
        village_name: 'Banjarsari',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
    }

    beforeEach(() => {
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
        parentRepository = new ParentRepository(
            mockDb as unknown as ConstructorParameters<
                typeof ParentRepository
            >[0]
        )
    })

    describe('create', () => {
        it('should insert and return the newly created parent', async () => {
            mockDb.returning.mockResolvedValue([mockParent])

            const newParent: NewParent = {
                user_id: 'user-123',
                identity_number: '1234567890123456'
            }

            const result = await parentRepository.create(newParent)

            expect(mockDb.insert).toHaveBeenCalledWith(parents)
            expect(mockDb.values).toHaveBeenCalledWith(newParent)
            expect(result).toEqual(mockParent)
        })
    })

    describe('findById', () => {
        it('should return a parent by id', async () => {
            mockDb.limit.mockResolvedValue([mockParent])

            const result = await parentRepository.findById('parent-123')

            expect(mockDb.select).toHaveBeenCalled()
            expect(mockDb.from).toHaveBeenCalledWith(parents)
            expect(mockDb.limit).toHaveBeenCalledWith(1)
            expect(result).toEqual(mockParent)
        })

        it('should return undefined if parent not found', async () => {
            mockDb.limit.mockResolvedValue([])

            const result = await parentRepository.findById('non-existent')

            expect(result).toBeUndefined()
        })
    })

    describe('update', () => {
        it('should update parent fields and return the updated parent', async () => {
            const updatedParent = { ...mockParent, village_name: 'New Village' }
            mockDb.returning.mockResolvedValue([updatedParent])

            const result = await parentRepository.update('parent-123', {
                village_name: 'New Village'
            })

            expect(mockDb.update).toHaveBeenCalledWith(parents)
            expect(mockDb.set).toHaveBeenCalledWith({
                village_name: 'New Village'
            })
            expect(result).toEqual(updatedParent)
        })
    })

    describe('softDelete', () => {
        it('should update parent status to inactive', async () => {
            const deletedParent = { ...mockParent, status: 'inactive' as const }
            mockDb.returning.mockResolvedValue([deletedParent])

            const result = await parentRepository.softDelete('parent-123')

            expect(mockDb.update).toHaveBeenCalledWith(parents)
            expect(mockDb.set).toHaveBeenCalledWith({ status: 'inactive' })
            expect(result).toEqual(deletedParent)
        })
    })

    describe('hardDelete', () => {
        it('should permanently delete parent from db', async () => {
            mockDb.returning.mockResolvedValue([mockParent])

            const result = await parentRepository.hardDelete('parent-123')

            expect(mockDb.delete).toHaveBeenCalledWith(parents)
            expect(result).toEqual(mockParent)
        })
    })

    describe('existsByIdentityNumber', () => {
        it('should return true if parent with given NIK exists', async () => {
            mockDb.limit.mockResolvedValue([{ id: 'parent-123' }])

            const result =
                await parentRepository.existsByIdentityNumber(
                    '1234567890123456'
                )

            expect(mockDb.select).toHaveBeenCalledWith({ id: parents.id })
            expect(mockDb.from).toHaveBeenCalledWith(parents)
            expect(mockDb.limit).toHaveBeenCalledWith(1)
            expect(result).toBe(true)
        })

        it('should return false if parent does not exist', async () => {
            mockDb.limit.mockResolvedValue([])

            const result =
                await parentRepository.existsByIdentityNumber('non-existent')

            expect(result).toBe(false)
        })
    })
})
