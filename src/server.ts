import app from '@/app'
import env from '@/configs/env'
import { logger } from '@/utils/logger'
import { configureGracefulShutdown } from '@/utils/shutdown'
import { CronService } from '@/services/cron-service'

const port = env.PORT || 9000

const server = app.listen(port, () => {
    const divider = '─'.repeat(50)

    logger.info('🚀 Sampurasun! Posyandu Server Mode On 🚀')
    logger.info(divider)
    logger.info(`📡 Local URL    : http://localhost:${port}`)
    logger.info(`🌍 Environment  : ${env.NODE_ENV.toUpperCase()}`)
    logger.info(`📖 Swagger Docs : http://localhost:${port}/api/docs`)
    logger.info(divider)

    CronService.start()
})

configureGracefulShutdown(server, () => {
    CronService.stop()
})
