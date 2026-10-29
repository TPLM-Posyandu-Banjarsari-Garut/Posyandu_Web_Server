import { jest } from '@jest/globals'
import type { Request, Response } from 'express'
import {
    handleDeleteRequest,
    handleGetByIdRequest,
    handleRestoreRequest
} from '../controller-handlers'

function response(user = { id: 'user-1', role: 'admin' }) {
    const res = {
        locals: { user },
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
    }
    return { res: res as unknown as Response, ...res }
}

describe('shared controller handlers', () => {
    it('loads a record using the route id and authenticated user', async () => {
        const { res, json } = response()
        const req = { params: { public_id: 'record-1' } } as unknown as Request
        const getById = jest.fn().mockResolvedValue({ id: 'record-1' })

        await handleGetByIdRequest(req, res, 'Record', getById)

        expect(getById).toHaveBeenCalledWith('record-1', res.locals.user)
        expect(json).toHaveBeenCalledWith({
            success: true,
            message: 'Record retrieved successfully',
            statusCode: 200,
            data: { id: 'record-1' }
        })
    })

    it.each([
        ['true', true],
        ['false', false],
        [undefined, false]
    ])('passes permanent=%s when deleting', async (query, expected) => {
        const { res } = response()
        const req = {
            params: { public_id: 'record-1' },
            query: query === undefined ? {} : { permanent: query }
        } as unknown as Request
        const deleteRecord = jest.fn().mockResolvedValue({ id: 'record-1' })

        await handleDeleteRequest(req, res, 'Record', deleteRecord)

        expect(deleteRecord).toHaveBeenCalledWith(
            'record-1',
            expected,
            res.locals.user
        )
    })

    it('restores a record for the authenticated user', async () => {
        const { res, json } = response()
        const req = { params: { public_id: 'record-2' } } as unknown as Request
        const restore = jest.fn().mockResolvedValue({ id: 'record-2' })

        await handleRestoreRequest(req, res, 'Record', restore)

        expect(restore).toHaveBeenCalledWith('record-2', res.locals.user)
        expect(json).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Record restored successfully',
                data: { id: 'record-2' }
            })
        )
    })
})
