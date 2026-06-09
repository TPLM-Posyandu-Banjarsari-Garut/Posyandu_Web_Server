import { CadreService } from '@/services/cadres-service'
import { CadreRepository } from '@/repositories/cadres-repository'
import { Cadre } from '@/db'

describe('CadreService Unit Tests', () => {
    let cadreService: CadreService
    let mockCadreRepository: jest.Mocked<CadreRepository>

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
        jest.clearAllMocks()

        mockCadreRepository = {
            create: jest.fn(),
            findAll: jest.fn(),
            getCadres: jest.fn(),
            findById: jest.fn(),
            findByUserId: jest.fn(),
            findByPosyanduId: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
            hardDelete: jest.fn(),
            restore: jest.fn()
        } as unknown as jest.Mocked<CadreRepository>

        cadreService = new CadreService(mockCadreRepository)
    })

    describe('createCadre', () => {
        const createPayload = {
            user_id: 'user-123',
            posyandu_id: 'posyandu-123',
            position: 'member' as const
        }

        it('should successfully create a cadre', async () => {
            mockCadreRepository.findByUserId.mockResolvedValue([])
            mockCadreRepository.create.mockResolvedValue(
                mockCadre as unknown as Cadre
            )

            const result = await cadreService.createCadre(createPayload)

            expect(mockCadreRepository.findByUserId).toHaveBeenCalledWith(
                'user-123'
            )
            expect(mockCadreRepository.create).toHaveBeenCalledWith(
                createPayload
            )
            expect(result).toEqual(mockCadre)
        })

        it('should throw an error if user is already a cadre in this posyandu', async () => {
            mockCadreRepository.findByUserId.mockResolvedValue([
                mockCadre as unknown as Cadre
            ])

            await expect(
                cadreService.createCadre(createPayload)
            ).rejects.toThrow('User is already a cadre in this posyandu')
            expect(mockCadreRepository.create).not.toHaveBeenCalled()
        })
    })

    describe('getCadres', () => {
        it('should return a paginated list of cadres', async () => {
            const mockCadres = [mockCadre]
            mockCadreRepository.getCadres.mockResolvedValue({
                data: mockCadres as unknown as Cadre[],
                totalItems: 1
            })

            const result = await cadreService.getCadres({ page: 1, limit: 10 })

            expect(mockCadreRepository.getCadres).toHaveBeenCalledWith({
                page: 1,
                limit: 10
            })
            expect(result).toEqual({
                data: mockCadres,
                meta: {
                    page: 1,
                    limit: 10,
                    total_items: 1,
                    total_pages: 1
                }
            })
        })
    })

    describe('getCadreById', () => {
        it('should return a cadre by id', async () => {
            mockCadreRepository.findById.mockResolvedValue(
                mockCadre as unknown as Cadre
            )

            const result = await cadreService.getCadreById('cadre-123')

            expect(mockCadreRepository.findById).toHaveBeenCalledWith(
                'cadre-123'
            )
            expect(result).toEqual(mockCadre)
        })

        it('should throw an error if cadre not found', async () => {
            mockCadreRepository.findById.mockResolvedValue(undefined)

            await expect(
                cadreService.getCadreById('cadre-123')
            ).rejects.toThrow('Cadre not found')
        })
    })

    describe('updateCadre', () => {
        it('should update a cadre and return the updated cadre', async () => {
            const updatePayload = { position: 'leader' as const }
            mockCadreRepository.findById.mockResolvedValue(
                mockCadre as unknown as Cadre
            )
            mockCadreRepository.update.mockResolvedValue({
                ...mockCadre,
                ...updatePayload
            } as unknown as Cadre)

            const result = await cadreService.updateCadre(
                'cadre-123',
                updatePayload
            )

            expect(mockCadreRepository.findById).toHaveBeenCalledWith(
                'cadre-123'
            )
            expect(mockCadreRepository.update).toHaveBeenCalledWith(
                'cadre-123',
                updatePayload
            )
            expect(result).toEqual({ ...mockCadre, ...updatePayload })
        })

        it('should throw an error if assigning to a posyandu where user is already a cadre', async () => {
            const updatePayload = { posyandu_id: 'posyandu-456' }
            mockCadreRepository.findById.mockResolvedValue(
                mockCadre as unknown as Cadre
            )

            const existingOtherCadre = {
                ...mockCadre,
                id: 'cadre-999',
                posyandu_id: 'posyandu-456'
            }
            mockCadreRepository.findByUserId.mockResolvedValue([
                existingOtherCadre as unknown as Cadre
            ])

            await expect(
                cadreService.updateCadre('cadre-123', updatePayload)
            ).rejects.toThrow('User is already a cadre in this posyandu')
            expect(mockCadreRepository.update).not.toHaveBeenCalled()
        })
    })

    describe('deleteCadre', () => {
        it('should soft delete a cadre', async () => {
            mockCadreRepository.findById.mockResolvedValue(
                mockCadre as unknown as Cadre
            )
            mockCadreRepository.softDelete.mockResolvedValue({
                ...mockCadre,
                status: 'inactive'
            } as unknown as Cadre)

            const result = await cadreService.deleteCadre('cadre-123', false)

            expect(mockCadreRepository.softDelete).toHaveBeenCalledWith(
                'cadre-123'
            )
            expect(mockCadreRepository.hardDelete).not.toHaveBeenCalled()
            expect(result).toEqual({ ...mockCadre, status: 'inactive' })
        })

        it('should hard delete a cadre', async () => {
            mockCadreRepository.findById.mockResolvedValue(
                mockCadre as unknown as Cadre
            )
            mockCadreRepository.hardDelete.mockResolvedValue(
                mockCadre as unknown as Cadre
            )

            const result = await cadreService.deleteCadre('cadre-123', true)

            expect(mockCadreRepository.hardDelete).toHaveBeenCalledWith(
                'cadre-123'
            )
            expect(mockCadreRepository.softDelete).not.toHaveBeenCalled()
            expect(result).toEqual(mockCadre)
        })
    })

    describe('restoreCadre', () => {
        it('should restore a cadre', async () => {
            mockCadreRepository.restore.mockResolvedValue({
                ...mockCadre,
                status: 'active'
            } as unknown as Cadre)

            const result = await cadreService.restoreCadre('cadre-123')

            expect(mockCadreRepository.restore).toHaveBeenCalledWith(
                'cadre-123'
            )
            expect(result).toEqual({ ...mockCadre, status: 'active' })
        })

        it('should throw an error if restoration fails', async () => {
            mockCadreRepository.restore.mockResolvedValue(undefined)

            await expect(
                cadreService.restoreCadre('cadre-123')
            ).rejects.toThrow('Failed to restore cadre')
        })
    })
})
