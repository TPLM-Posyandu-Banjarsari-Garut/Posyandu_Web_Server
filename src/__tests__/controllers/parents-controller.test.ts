import { ParentController } from '@/controllers/parents-controller'
import { ParentService } from '@/services/parents-service'
import { Request, Response } from 'express'
import { ApiResponse } from '@/utils/api-response'
import { logger } from '@/utils/logger'
import { Parent } from '@/db'

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

describe('ParentController Unit Tests', () => {
    let parentController: ParentController
    let mockParentService: jest.Mocked<ParentService>
    let mockReq: Partial<Request>
    let mockRes: Partial<Response>

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

        mockParentService = {
            createParent: jest.fn(),
            getParents: jest.fn(),
            getParentById: jest.fn(),
            updateParent: jest.fn(),
            deleteParent: jest.fn(),
            restoreParent: jest.fn()
        } as unknown as jest.Mocked<ParentService>

        parentController = new ParentController(mockParentService)

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

    describe('createParent', () => {
        it('should create a parent profile and return 201 Created', async () => {
            mockReq.body = {
                user_id: 'user-123',
                identity_number: '1234567890123456'
            }

            mockParentService.createParent.mockResolvedValue(mockParent)

            await parentController.createParent(
                mockReq as Request,
                mockRes as Response
            )

            expect(mockParentService.createParent).toHaveBeenCalledWith(
                mockReq.body
            )
            expect(ApiResponse.created).toHaveBeenCalledWith(
                mockRes,
                'Parent created successfully',
                mockParent
            )
            expect(logger.info).toHaveBeenCalled()
        })
    })

    describe('getParents', () => {
        it('should retrieve parents and return 200 OK', async () => {
            mockReq.query = { page: '1', limit: '10' }
            const mockResult = {
                data: [mockParent],
                meta: { page: 1, limit: 10, total_items: 1, total_pages: 1 }
            }

            mockParentService.getParents.mockResolvedValue(
                mockResult as unknown as Awaited<
                    ReturnType<ParentService['getParents']>
                >
            )

            await parentController.getParents(
                mockReq as Request,
                mockRes as Response
            )

            expect(mockParentService.getParents).toHaveBeenCalledWith(
                mockReq.query
            )
            expect(ApiResponse.ok).toHaveBeenCalledWith(
                mockRes,
                'Parents retrieved successfully',
                mockResult
            )
        })
    })

    describe('getParentById', () => {
        it('should retrieve parent by ID and return 200 OK', async () => {
            mockReq.params = { public_id: 'parent-123' }

            mockParentService.getParentById.mockResolvedValue(mockParent)

            await parentController.getParentById(
                mockReq as Request,
                mockRes as Response
            )

            expect(mockParentService.getParentById).toHaveBeenCalledWith(
                'parent-123'
            )
            expect(ApiResponse.ok).toHaveBeenCalledWith(
                mockRes,
                'Parent retrieved successfully',
                mockParent
            )
        })
    })

    describe('updateParent', () => {
        it('should update parent and return 200 OK', async () => {
            mockReq.params = { public_id: 'parent-123' }
            mockReq.body = { village_name: 'New Village' }

            const updatedParent = { ...mockParent, ...mockReq.body }
            mockParentService.updateParent.mockResolvedValue(updatedParent)

            await parentController.updateParent(
                mockReq as Request,
                mockRes as Response
            )

            expect(mockParentService.updateParent).toHaveBeenCalledWith(
                'parent-123',
                mockReq.body
            )
            expect(ApiResponse.ok).toHaveBeenCalledWith(
                mockRes,
                'Parent updated successfully',
                updatedParent
            )
        })
    })

    describe('deleteParent', () => {
        it('should soft delete parent and return 200 OK', async () => {
            mockReq.params = { public_id: 'parent-123' }
            mockReq.query = { permanent: 'false' }

            const deletedParent = { ...mockParent, status: 'inactive' as const }
            mockParentService.deleteParent.mockResolvedValue(deletedParent)

            await parentController.deleteParent(
                mockReq as Request,
                mockRes as Response
            )

            expect(mockParentService.deleteParent).toHaveBeenCalledWith(
                'parent-123',
                false
            )
            expect(ApiResponse.ok).toHaveBeenCalledWith(
                mockRes,
                'Parent deleted successfully',
                deletedParent
            )
        })

        it('should hard delete parent when permanent=true', async () => {
            mockReq.params = { public_id: 'parent-123' }
            mockReq.query = { permanent: 'true' }

            mockParentService.deleteParent.mockResolvedValue(mockParent)

            await parentController.deleteParent(
                mockReq as Request,
                mockRes as Response
            )

            expect(mockParentService.deleteParent).toHaveBeenCalledWith(
                'parent-123',
                true
            )
        })
    })

    describe('restoreParent', () => {
        it('should restore parent and return 200 OK', async () => {
            mockReq.params = { public_id: 'parent-123' }

            const restoredParent = { ...mockParent, status: 'active' as const }
            mockParentService.restoreParent.mockResolvedValue(restoredParent)

            await parentController.restoreParent(
                mockReq as Request,
                mockRes as Response
            )

            expect(mockParentService.restoreParent).toHaveBeenCalledWith(
                'parent-123'
            )
            expect(ApiResponse.ok).toHaveBeenCalledWith(
                mockRes,
                'Parent restored successfully',
                restoredParent
            )
        })
    })
})
