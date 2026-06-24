import type { Server } from 'node:http'
import { logger } from '@/utils/logger'

export const configureGracefulShutdown = (
    server: Server,
    onCleanup?: () => Promise<void> | void
) => {
    const shutdown = (signal: string) => {
        logger.warn(`⚠️ ${signal} received. Shutting down gracefully...`)

        setTimeout(() => process.exit(1), 10000).unref()

        server.close(async err => {
            if (err) logger.error(err, '❌ Error closing HTTP server')

            try {
                if (onCleanup) await onCleanup()

                logger.info('👋 Server shut down cleanly.')
                process.exit(0)
            } catch (cleanupErr) {
                logger.error(cleanupErr, '❌ Error during cleanup')
                process.exit(1)
            }
        })
    }

    process.once('SIGTERM', () => shutdown('SIGTERM'))
    process.once('SIGINT', () => shutdown('SIGINT'))
}
