import { Router } from 'express'
import { CronService } from '@/services/cron-service'
import { logger } from '@/utils/logger'
import { ApiResponse } from '@/utils/api-response'
import { ApiError } from '@/utils/api-error'
import env from '@/configs/env'

const router = Router()

router.post('/trigger', async (req, res) => {
    const authHeader = req.headers.authorization
    const expectedToken = `Bearer ${env.CRON_SECRET}`

    if (authHeader !== expectedToken) {
        logger.warn('Unauthorized cron trigger attempt blocked')
        throw ApiError.unauthorized('Unauthorized')
    }

    const task = req.body?.task as string | undefined

    await CronService.triggerCronJobs(task)
    return ApiResponse.ok(res, 'Cron jobs triggered successfully')
})

export default router
