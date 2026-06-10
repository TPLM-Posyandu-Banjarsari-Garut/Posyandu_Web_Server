import { CadreController } from '@/controllers/cadres-controller'
import { CadreService } from '@/services/cadres-service'
import { Request, Response } from 'express'
import { ApiResponse } from '@/utils/api-response'
import { logger } from '@/utils/logger'
import { Cadre } from '@/db'

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

describe('CadreController Unit Tests', () => {
    let cadreController: CadreController
    let mockCadreService: jest.Mocked<CadreService>
    let mockReq: Partial<Request>
    let mockRes: Partial<Response>

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

        mockCadreService = {
            createCadre: jest.fn(),
            getCadres: jest.fn(),
            getCadreById: jest.fn(),
            updateCadre: jest.fn(),
            deleteCadre: jest.fn(),
            restoreCadre: jest.fn()
        } as unknown as jest.Mocked<CadreService>

        cadreController = new CadreController(mockCadreService)

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

    describe('createCadre', () => {
        it('should create a cadre and return 201 Created', async () => {
            mockReq.body = {
                user_id: 'user-123',
                posyandu_id: 'posyandu-123',
                position: 'member'
            }

            mockCadreService.createCadre.mockResolvedValue(mockCadre)

            await cadreController.createCadre(
                mockReq as Request,
                mockRes as Response
            )

            expect(mockCadreService.createCadre).toHaveBeenCalledWith(
                mockReq.body
            )
            expect(ApiResponse.created).toHaveBeenCalledWith(
                mockRes,
                'Cadre created successfully',
                mockCadre
            )
            expect(logger.info).toHaveBeenCalled()
        })
    })

    describe('getCadres', () => {
        it('should retrieve cadres and return 200 OK', async () => {
            mockReq.query = { page: '1', limit: '10' }
            const mockResult = {
                data: [mockCadre],
                meta: { page: 1, limit: 10, total_items: 1, total_pages: 1 }
            }

            mockCadreService.getCadres.mockResolvedValue(mockResult)

            await cadreController.getCadres(
                mockReq as Request,
                mockRes as Response
            )

            expect(mockCadreService.getCadres).toHaveBeenCalledWith(
                mockReq.query
            )
            expect(ApiResponse.ok).toHaveBeenCalledWith(
                mockRes,
                'Cadres retrieved successfully',
                mockResult
            )
        })
    })

    describe('getCadreById', () => {
        it('should retrieve cadre by ID and return 200 OK', async () => {
            mockReq.params = { public_id: 'cadre-123' }

            mockCadreService.getCadreById.mockResolvedValue(mockCadre)

            await cadreController.getCadreById(
                mockReq as Request,
                mockRes as Response
            )

            expect(mockCadreService.getCadreById).toHaveBeenCalledWith(
                'cadre-123'
            )
            expect(ApiResponse.ok).toHaveBeenCalledWith(
                mockRes,
                'Cadre retrieved successfully',
                mockCadre
            )
        })
    })

    describe('updateCadre', () => {
        it('should update cadre and return 200 OK', async () => {
            mockReq.params = { public_id: 'cadre-123' }
            mockReq.body = { position: 'leader' }

            const updatedCadre = { ...mockCadre, ...mockReq.body }
            mockCadreService.updateCadre.mockResolvedValue(updatedCadre)

            await cadreController.updateCadre(
                mockReq as Request,
                mockRes as Response
            )

            expect(mockCadreService.updateCadre).toHaveBeenCalledWith(
                'cadre-123',
                mockReq.body
            )
            expect(ApiResponse.ok).toHaveBeenCalledWith(
                mockRes,
                'Cadre updated successfully',
                updatedCadre
            )
        })
    })

    describe('deleteCadre', () => {
        it('should soft delete cadre and return 200 OK', async () => {
            mockReq.params = { public_id: 'cadre-123' }
            mockReq.query = { permanent: 'false' }

            const deletedCadre = { ...mockCadre, status: 'inactive' as const }
            mockCadreService.deleteCadre.mockResolvedValue(deletedCadre)

            await cadreController.deleteCadre(
                mockReq as Request,
                mockRes as Response
            )

            expect(mockCadreService.deleteCadre).toHaveBeenCalledWith(
                'cadre-123',
                false
            )
            expect(ApiResponse.ok).toHaveBeenCalledWith(
                mockRes,
                'Cadre deleted successfully',
                deletedCadre
            )
        })

        it('should hard delete cadre when permanent=true', async () => {
            mockReq.params = { public_id: 'cadre-123' }
            mockReq.query = { permanent: 'true' }

            mockCadreService.deleteCadre.mockResolvedValue(mockCadre)

            await cadreController.deleteCadre(
                mockReq as Request,
                mockRes as Response
            )

            expect(mockCadreService.deleteCadre).toHaveBeenCalledWith(
                'cadre-123',
                true
            )
        })
    })

    describe('restoreCadre', () => {
        it('should restore cadre and return 200 OK', async () => {
            mockReq.params = { public_id: 'cadre-123' }

            const restoredCadre = { ...mockCadre, status: 'active' as const }
            mockCadreService.restoreCadre.mockResolvedValue(restoredCadre)

            await cadreController.restoreCadre(
                mockReq as Request,
                mockRes as Response
            )

            expect(mockCadreService.restoreCadre).toHaveBeenCalledWith(
                'cadre-123'
            )
            expect(ApiResponse.ok).toHaveBeenCalledWith(
                mockRes,
                'Cadre restored successfully',
                restoredCadre
            )
        })
    })
})
