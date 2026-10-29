import { jest } from '@jest/globals'
import type { NextFunction, Request, Response } from 'express'
import { AsyncHandler } from '../async-handler'

const req = {} as Request
const res = {} as Response

describe('AsyncHandler', () => {
    it('forwards rejected handler promises to Express', async () => {
        const failure = new Error('request failed')
        const next = jest.fn() as unknown as NextFunction
        const handler = AsyncHandler(async () => {
            throw failure
        })

        handler(req, res, next)
        await new Promise(resolve => setImmediate(resolve))

        expect(next).toHaveBeenCalledWith(failure)
    })

    it('invokes successful handlers with the Express arguments', async () => {
        const next = jest.fn() as unknown as NextFunction
        const fn = jest.fn().mockResolvedValue(undefined)
        const handler = AsyncHandler(fn)

        handler(req, res, next)
        await new Promise(resolve => setImmediate(resolve))

        expect(fn).toHaveBeenCalledWith(req, res, next)
        expect(next).not.toHaveBeenCalled()
    })
})
