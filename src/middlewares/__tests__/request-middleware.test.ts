import { jest } from '@jest/globals'
import type { NextFunction, Request, Response } from 'express'
import { authorizeRoles } from '../authorize-role'
import { errorHandler } from '../error-handler'
import { notFoundHandler } from '../not-found-handler'
import { validateRequest } from '../validate-request'
import { ApiError, ErrorCode } from '@/utils/api-error'
import { STATUS_CODES } from '@/constants/status-codes'
import { z } from 'zod'

function createResponse(locals: Record<string, unknown> = {}) {
    const res = {
        locals,
        headersSent: false,
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
    }

    return { res: res as unknown as Response, ...res }
}

describe('authorizeRoles', () => {
    it('allows an authenticated user with an allowed role', () => {
        const next = jest.fn() as unknown as NextFunction
        const { res } = createResponse({ user: { role: 'midwife' } })

        authorizeRoles('midwife', 'cadre')({} as Request, res, next)

        expect(next).toHaveBeenCalledWith()
    })

    it('returns unauthorized when no session user is attached', () => {
        const next = jest.fn() as unknown as NextFunction

        authorizeRoles('parent')({} as Request, createResponse().res, next)

        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                statusCode: STATUS_CODES.UNAUTHORIZED,
                code: ErrorCode.UNAUTHORIZED
            })
        )
    })

    it('returns forbidden when the role is not permitted', () => {
        const next = jest.fn() as unknown as NextFunction
        const { res } = createResponse({ user: { role: 'parent' } })

        authorizeRoles('midwife')({} as Request, res, next)

        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                statusCode: STATUS_CODES.FORBIDDEN,
                code: ErrorCode.FORBIDDEN
            })
        )
    })
})

describe('validateRequest', () => {
    it('writes transformed body, query, and path parameters back to request', async () => {
        const req = {
            body: { name: '  Aisyah  ' },
            query: { page: '2' },
            params: { public_id: 'child-1' }
        } as unknown as Request
        const next = jest.fn() as unknown as NextFunction
        const middleware = validateRequest({
            body: z.object({ name: z.string().trim() }),
            query: z.object({ page: z.coerce.number() }),
            params: z.object({ public_id: z.string().min(1) })
        })

        await middleware(req, {} as Response, next)

        expect(req.body).toEqual({ name: 'Aisyah' })
        expect(req.query).toEqual({ page: 2 })
        expect(req.params).toEqual({ public_id: 'child-1' })
        expect(next).toHaveBeenCalledWith()
    })

    it('converts schema failures into validation ApiErrors', async () => {
        const req = { body: { age: 'young' }, query: {}, params: {} } as Request
        const next = jest.fn() as unknown as NextFunction
        const middleware = validateRequest({
            body: z.object({ age: z.coerce.number().int().positive() })
        })

        await middleware(req, {} as Response, next)

        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                statusCode: STATUS_CODES.BAD_REQUEST,
                code: ErrorCode.VALIDATION_ERROR,
                message: 'Invalid request data',
                errors: expect.objectContaining({ body: expect.any(Array) })
            })
        )
    })

    it('forwards unexpected parser failures', async () => {
        const req = {
            body: {},
            query: Object.freeze({ page: 1 }),
            params: {}
        } as Request
        const next = jest.fn() as unknown as NextFunction
        const middleware = validateRequest({
            query: z.object({ page: z.number() })
        })

        await middleware(req, {} as Response, next)

        expect(next).toHaveBeenCalledWith(expect.any(TypeError))
    })
})

describe('error and not-found middleware', () => {
    it('maps ApiError fields into the response body', () => {
        const { res, status, json } = createResponse()
        const error = ApiError.validation('Invalid data', {
            name: ['required']
        })

        errorHandler(
            error,
            { method: 'POST', path: '/api/parents' } as Request,
            res,
            jest.fn()
        )

        expect(status).toHaveBeenCalledWith(STATUS_CODES.BAD_REQUEST)
        expect(json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                message: 'Invalid data',
                statusCode: STATUS_CODES.BAD_REQUEST,
                errors: { name: ['required'] },
                stack: expect.any(String)
            })
        )
    })

    it('passes errors to the next handler when headers were already sent', () => {
        const { res } = createResponse()
        Object.assign(res, { headersSent: true })
        const error = new Error('already sent')
        const next = jest.fn() as unknown as NextFunction

        errorHandler(error, {} as Request, res, next)

        expect(next).toHaveBeenCalledWith(error)
    })

    it('throws a route-specific not-found error', () => {
        expect(() =>
            notFoundHandler(
                { method: 'GET', path: '/api/missing' } as Request,
                {} as Response,
                jest.fn()
            )
        ).toThrow('Route GET /api/missing not found')
    })
})
