import { Request, Response } from 'express'
import { ApiResponse } from '@/utils/api-response'
import { AsyncHandler } from '@/utils/async-handler'
import db from '@/configs/db'

export const healthCheck = AsyncHandler(
    async (_req: Request, res: Response) => {
        return ApiResponse.ok(res, 'Service is healthy', {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        })
    }
)

export const detailedHealthCheck = AsyncHandler(
    async (_req: Request, res: Response) => {
        const healthData = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
            version: process.env.npm_package_version || '1.0.0',
            memory: {
                used:
                    Math.round(
                        (process.memoryUsage().heapUsed / 1024 / 1024) * 100
                    ) / 100,
                total:
                    Math.round(
                        (process.memoryUsage().heapTotal / 1024 / 1024) * 100
                    ) / 100,
                unit: 'MB'
            },
            cpu: {
                usage: process.cpuUsage()
            }
        }

        return ApiResponse.ok(res, 'Service is healthy', healthData)
    }
)

export const readyHealthCheck = AsyncHandler(
    async (_req: Request, res: Response) => {
        let dbStatus = false
        try {
            const { sql } = await import('drizzle-orm')
            await db.execute(sql`SELECT 1`)
            dbStatus = true
        } catch {
            dbStatus = false
        }

        const isReady = dbStatus

        if (isReady) {
            return ApiResponse.ok(res, 'Service is ready', {
                status: 'ready',
                checks: { database: dbStatus },
                timestamp: new Date().toISOString()
            })
        }

        res.status(503).json({
            success: false,
            message: 'Service is not ready',
            data: {
                status: 'not ready',
                checks: { database: dbStatus },
                timestamp: new Date().toISOString()
            }
        })
    }
)
