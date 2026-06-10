import { ParentService } from '@/services/parents-service'
import { ParentRepository } from '@/repositories/parents-repository'
import { Parent, NewParent } from '@/db'

describe('ParentService Unit Tests', () => {
    let parentService: ParentService
    let mockParentRepository: jest.Mocked<ParentRepository>

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
        jest.clearAllMocks()

        mockParentRepository = {
            create: jest.fn(),
            findAll: jest.fn(),
            getParents: jest.fn(),
            findById: jest.fn(),
            findByUserId: jest.fn(),
            findByIdentityNumber: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
            hardDelete: jest.fn(),
            restore: jest.fn(),
            existsByIdentityNumber: jest.fn()
        } as unknown as jest.Mocked<ParentRepository>

        parentService = new ParentService(mockParentRepository)
    })

    describe('createParent', () => {
        const createPayload: NewParent = {
            user_id: 'user-123',
            identity_number: '1234567890123456'
        }

        it('should successfully create a parent profile', async () => {
            mockParentRepository.findByUserId.mockResolvedValue(undefined)
            mockParentRepository.existsByIdentityNumber.mockResolvedValue(false)
            mockParentRepository.create.mockResolvedValue(mockParent)

            const result = await parentService.createParent(createPayload)

            expect(mockParentRepository.findByUserId).toHaveBeenCalledWith(
                'user-123'
            )
            expect(
                mockParentRepository.existsByIdentityNumber
            ).toHaveBeenCalledWith('1234567890123456')
            expect(mockParentRepository.create).toHaveBeenCalledWith(
                createPayload
            )
            expect(result).toEqual(mockParent)
        })

        it('should throw an error if user already has a parent profile', async () => {
            mockParentRepository.findByUserId.mockResolvedValue(mockParent)

            await expect(
                parentService.createParent(createPayload)
            ).rejects.toThrow('User already has a parent profile')
            expect(mockParentRepository.create).not.toHaveBeenCalled()
        })

        it('should throw an error if NIK is already registered', async () => {
            mockParentRepository.findByUserId.mockResolvedValue(undefined)
            mockParentRepository.existsByIdentityNumber.mockResolvedValue(true)

            await expect(
                parentService.createParent(createPayload)
            ).rejects.toThrow('Identity number (NIK) is already registered')
            expect(mockParentRepository.create).not.toHaveBeenCalled()
        })
    })

    describe('getParents', () => {
        it('should return a paginated list of parents', async () => {
            const mockParents = [mockParent]
            mockParentRepository.getParents.mockResolvedValue({
                data: mockParents,
                totalItems: 1
            })

            const result = await parentService.getParents({
                page: 1,
                limit: 10
            })

            expect(mockParentRepository.getParents).toHaveBeenCalledWith({
                page: 1,
                limit: 10
            })
            expect(result).toEqual({
                data: mockParents,
                meta: {
                    page: 1,
                    limit: 10,
                    total_items: 1,
                    total_pages: 1
                }
            })
        })
    })

    describe('getParentById', () => {
        it('should return a parent profile by id', async () => {
            mockParentRepository.findById.mockResolvedValue(mockParent)

            const result = await parentService.getParentById('parent-123')

            expect(mockParentRepository.findById).toHaveBeenCalledWith(
                'parent-123'
            )
            expect(result).toEqual(mockParent)
        })

        it('should throw an error if parent not found', async () => {
            mockParentRepository.findById.mockResolvedValue(undefined)

            await expect(
                parentService.getParentById('parent-123')
            ).rejects.toThrow('Parent profile not found')
        })
    })

    describe('updateParent', () => {
        it('should update a parent profile and return the updated parent', async () => {
            const updatePayload = { village_name: 'New Village' }
            mockParentRepository.findById.mockResolvedValue(mockParent)
            mockParentRepository.update.mockResolvedValue({
                ...mockParent,
                ...updatePayload
            })

            const result = await parentService.updateParent(
                'parent-123',
                updatePayload
            )

            expect(mockParentRepository.findById).toHaveBeenCalledWith(
                'parent-123'
            )
            expect(mockParentRepository.update).toHaveBeenCalledWith(
                'parent-123',
                updatePayload
            )
            expect(result).toEqual({ ...mockParent, ...updatePayload })
        })

        it('should throw an error if assigning a NIK already used by another parent', async () => {
            const updatePayload = { identity_number: '9876543210987654' }
            mockParentRepository.findById.mockResolvedValue(mockParent)
            mockParentRepository.existsByIdentityNumber.mockResolvedValue(true)

            await expect(
                parentService.updateParent('parent-123', updatePayload)
            ).rejects.toThrow(
                'Identity number (NIK) is already registered by another parent'
            )
            expect(mockParentRepository.update).not.toHaveBeenCalled()
        })

        it('should throw an error if assigning a user_id already used by another parent', async () => {
            const updatePayload = { user_id: 'user-456' }
            mockParentRepository.findById.mockResolvedValue(mockParent)
            const existingOtherParent: Parent = {
                ...mockParent,
                id: 'parent-999',
                user_id: 'user-456'
            }
            mockParentRepository.findByUserId.mockResolvedValue(
                existingOtherParent
            )

            await expect(
                parentService.updateParent('parent-123', updatePayload)
            ).rejects.toThrow('The target user already has a parent profile')
            expect(mockParentRepository.update).not.toHaveBeenCalled()
        })
    })

    describe('deleteParent', () => {
        it('should soft delete a parent profile', async () => {
            mockParentRepository.findById.mockResolvedValue(mockParent)
            mockParentRepository.softDelete.mockResolvedValue({
                ...mockParent,
                status: 'inactive' as const
            })

            const result = await parentService.deleteParent('parent-123', false)

            expect(mockParentRepository.softDelete).toHaveBeenCalledWith(
                'parent-123'
            )
            expect(mockParentRepository.hardDelete).not.toHaveBeenCalled()
            expect(result).toEqual({
                ...mockParent,
                status: 'inactive' as const
            })
        })

        it('should hard delete a parent profile', async () => {
            mockParentRepository.findById.mockResolvedValue(mockParent)
            mockParentRepository.hardDelete.mockResolvedValue(mockParent)

            const result = await parentService.deleteParent('parent-123', true)

            expect(mockParentRepository.hardDelete).toHaveBeenCalledWith(
                'parent-123'
            )
            expect(mockParentRepository.softDelete).not.toHaveBeenCalled()
            expect(result).toEqual(mockParent)
        })
    })

    describe('restoreParent', () => {
        it('should restore a parent profile', async () => {
            mockParentRepository.restore.mockResolvedValue({
                ...mockParent,
                status: 'active' as const
            })

            const result = await parentService.restoreParent('parent-123')

            expect(mockParentRepository.restore).toHaveBeenCalledWith(
                'parent-123'
            )
            expect(result).toEqual({ ...mockParent, status: 'active' as const })
        })

        it('should throw an error if restoration fails', async () => {
            mockParentRepository.restore.mockResolvedValue(undefined)

            await expect(
                parentService.restoreParent('parent-123')
            ).rejects.toThrow('Failed to restore parent profile')
        })
    })
})
