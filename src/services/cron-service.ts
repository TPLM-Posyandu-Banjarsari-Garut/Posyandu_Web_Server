import cron, { ScheduledTask } from 'node-cron'
import db from '@/configs/db'
import { verifications, sessions } from '@/db'
import { lt, sql } from 'drizzle-orm'
import { logger } from '@/utils/logger'

export class CronService {
    private static tasks: ScheduledTask[] = []

    static start(): void {
        logger.info('⏰ Initializing Cron Service...')

        const keepAliveTask = cron.schedule('*/5 * * * *', async () => {
            try {
                logger.debug('📡 Running DB Keep-Alive ping...')
                await db.execute(sql`SELECT 1`)
                logger.debug('✅ DB Keep-Alive ping successful.')
            } catch (error) {
                logger.error(error, '❌ DB Keep-Alive ping failed')
            }
        })
        this.tasks.push(keepAliveTask)

        const dailyCleanupTask = cron.schedule('0 0 * * *', async () => {
            try {
                logger.info(
                    '🧹 Starting daily cleanup of expired sessions and verifications...'
                )
                const now = new Date()

                const deletedVerifications = await db
                    .delete(verifications)
                    .where(lt(verifications.expires_at, now))
                    .returning()

                const deletedSessions = await db
                    .delete(sessions)
                    .where(lt(sessions.expires_at, now))
                    .returning()

                logger.info(
                    `✅ Daily cleanup complete. Removed ${deletedVerifications.length} expired verifications and ${deletedSessions.length} expired sessions.`
                )
            } catch (error) {
                logger.error(error, '❌ Error occurred during daily cleanup')
            }
        })
        this.tasks.push(dailyCleanupTask)

        logger.info(
            `🚀 Cron Service started successfully. Active jobs: ${this.tasks.length}`
        )
    }

    static stop(): void {
        logger.warn('🛑 Stopping Cron Service...')
        for (const task of this.tasks) {
            task.stop()
        }
        this.tasks = []
        logger.info('👋 Cron Service stopped.')
    }
}
