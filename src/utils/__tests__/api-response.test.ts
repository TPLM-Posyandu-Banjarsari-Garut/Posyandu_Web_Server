import { jest } from '@jest/globals'
import type { Response } from 'express'
import { ApiResponse } from '../api-response'
import { STATUS_CODES } from '@/constants/status-codes'

function createResponse() {
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
    }

    return { res: res as unknown as Response, ...res }
}

describe('ApiResponse', () => {
    it.each([
        ['ok', STATUS_CODES.OK, 'OK'],
        ['created', STATUS_CODES.CREATED, 'Created']
    ] as const)('%s sends a successful response', (method, status, message) => {
        const { res, status: setStatus, json } = createResponse()

        ApiResponse[method](res, message, { id: 'record-1' })

        expect(setStatus).toHaveBeenCalledWith(status)
        expect(json).toHaveBeenCalledWith({
            success: true,
            message,
            statusCode: status,
            data: { id: 'record-1' }
        })
    })

    it('includes pagination metadata and optional error details', () => {
        const { res, json } = createResponse()
        const meta = { page: 2, limit: 10, total_items: 11, total_pages: 2 }

        ApiResponse.paginated(res, [{ id: 'record-1' }], meta)

        expect(json).toHaveBeenCalledWith({
            success: true,
            message: 'OK',
            statusCode: STATUS_CODES.OK,
            data: [{ id: 'record-1' }],
            meta
        })

        ApiResponse.error(res, 'Invalid input', STATUS_CODES.BAD_REQUEST, {
            field: 'name'
        })
        expect(json).toHaveBeenLastCalledWith({
            success: false,
            message: 'Invalid input',
            statusCode: STATUS_CODES.BAD_REQUEST,
            errors: { field: 'name' }
        })
    })

    it('omits undefined data and errors', () => {
        const { res, json } = createResponse()

        ApiResponse.ok(res)
        expect(json).toHaveBeenCalledWith({
            success: true,
            message: 'OK',
            statusCode: STATUS_CODES.OK
        })
    })
})
