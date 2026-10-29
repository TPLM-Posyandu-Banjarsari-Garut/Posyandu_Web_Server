import { jest } from '@jest/globals'
import type { NextFunction, Request, Response } from 'express'
import { detailedHealthCheck, healthCheck } from '../health-controller'

function createResponse() {
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
    }
    return { res: res as unknown as Response, ...res }
}

describe('health controller', () => {
    it('returns a healthy status and runtime metadata', async () => {
        const { res, status, json } = createResponse()
        const next = jest.fn() as unknown as NextFunction

        healthCheck({} as Request, res, next)
        await new Promise(resolve => setImmediate(resolve))

        expect(status).toHaveBeenCalledWith(200)
        expect(json).toHaveBeenCalledWith({
            success: true,
            message: 'Service is healthy',
            statusCode: 200,
            data: expect.objectContaining({
                status: 'healthy',
                timestamp: expect.any(String),
                uptime: expect.any(Number)
            })
        })
        expect(next).not.toHaveBeenCalled()
    })

    it('reports runtime memory and CPU information', async () => {
        const { res, json } = createResponse()
        const next = jest.fn() as unknown as NextFunction

        detailedHealthCheck({} as Request, res, next)
        await new Promise(resolve => setImmediate(resolve))

        const payload = json.mock.calls[0]?.[0] as {
            data: {
                memory: { used: number; total: number; unit: string }
                cpu: { usage: object }
            }
        }
        expect(payload.data.memory.unit).toBe('MB')
        expect(payload.data.memory.used).toEqual(expect.any(Number))
        expect(payload.data.memory.total).toEqual(expect.any(Number))
        expect(payload.data.cpu.usage).toEqual(expect.any(Object))
    })
})
