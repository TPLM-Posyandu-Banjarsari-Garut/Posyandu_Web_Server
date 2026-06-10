import { CadreRepository } from '@/repositories/cadres-repository'
import { cadres, NewCadre, Cadre } from '@/db'

describe('CadreRepository CRUD Unit Tests', () => {
    let cadreRepository: CadreRepository
    let mockDb: Record<string, jest.Mock>

    const mockCadre: Cadre = {
        id: 'cadre-123',
        user_id: 'user-123',
        posyandu_id: 'posyandu-123',
        identity_number: '1234567890123456',
        position: 'member',
        is_primary_assignment: true,
        duty_area_notes: 'Area 1',
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
        cadreRepository = new CadreRepository(
            mockDb as unknown as ConstructorParameters<
                typeof CadreRepository
            >[0]
        )
    })

    describe('create', () => {
        it('should insert and return the newly created cadre', async () => {
            mockDb.returning.mockResolvedValue([mockCadre])

            const newCadre: NewCadre = {
                user_id: 'user-123',
                posyandu_id: 'posyandu-123',
                position: 'member'
            }

            const result = await cadreRepository.create(newCadre)

            expect(mockDb.insert).toHaveBeenCalledWith(cadres)
            expect(mockDb.values).toHaveBeenCalledWith(newCadre)
            expect(result).toEqual(mockCadre)
        })
    })

    describe('findById', () => {
        it('should return a cadre by id', async () => {
            mockDb.limit.mockResolvedValue([mockCadre])

            const result = await cadreRepository.findById('cadre-123')

            expect(mockDb.select).toHaveBeenCalled()
            expect(mockDb.from).toHaveBeenCalledWith(cadres)
            expect(mockDb.limit).toHaveBeenCalledWith(1)
            expect(result).toEqual(mockCadre)
        })

        it('should return undefined if cadre not found', async () => {
            mockDb.limit.mockResolvedValue([])

            const result = await cadreRepository.findById('non-existent')

            expect(result).toBeUndefined()
        })
    })

    describe('update', () => {
        it('should update cadre fields and return the updated cadre', async () => {
            const updatedCadre = { ...mockCadre, position: 'leader' as const }
            mockDb.returning.mockResolvedValue([updatedCadre])

            const result = await cadreRepository.update('cadre-123', {
                position: 'leader'
            })

            expect(mockDb.update).toHaveBeenCalledWith(cadres)
            expect(mockDb.set).toHaveBeenCalledWith({
                position: 'leader'
            })
            expect(result).toEqual(updatedCadre)
        })
    })

    describe('softDelete', () => {
        it('should update cadre status to inactive', async () => {
            const deletedCadre = { ...mockCadre, status: 'inactive' as const }
            mockDb.returning.mockResolvedValue([deletedCadre])

            const result = await cadreRepository.softDelete('cadre-123')

            expect(mockDb.update).toHaveBeenCalledWith(cadres)
            expect(mockDb.set).toHaveBeenCalledWith({ status: 'inactive' })
            expect(result).toEqual(deletedCadre)
        })
    })

    describe('hardDelete', () => {
        it('should permanently delete cadre from db', async () => {
            mockDb.returning.mockResolvedValue([mockCadre])

            const result = await cadreRepository.hardDelete('cadre-123')

            expect(mockDb.delete).toHaveBeenCalledWith(cadres)
            expect(result).toEqual(mockCadre)
        })
    })
})
