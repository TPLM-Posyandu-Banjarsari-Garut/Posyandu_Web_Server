import { Router } from 'express'
import { CronService } from '@/services/cron-service'
import { logger } from '@/utils/logger'
import { ApiResponse } from '@/utils/api-response'
import { ApiError } from '@/utils/api-error'

const router = Router()

router.post('/trigger', async (req, res) => {
    const authHeader = req.headers.authorization
    const expectedToken = `Bearer ${process.env.CRON_SECRET}`

    if (!process.env.CRON_SECRET) {
        logger.error('CRON_SECRET environment variable is not defined')
        throw ApiError.server('Internal server configuration error')
    }

    if (authHeader !== expectedToken) {
        logger.warn('Unauthorized cron trigger attempt blocked')
        throw ApiError.unauthorized('Unauthorized')
    }

    await CronService.triggerCronJobs()
    return ApiResponse.ok(res, 'Cron jobs triggered successfully')
})

export default router
