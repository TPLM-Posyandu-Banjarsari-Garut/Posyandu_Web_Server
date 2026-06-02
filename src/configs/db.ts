import { drizzle } from 'drizzle-orm/node-postgres'
import env from '@/configs/env'

const dbUrl = env.DATABASE_URL || ''

const db = drizzle(dbUrl, {
    logger: env.NODE_ENV === 'development'
})

export default db

/**
 * ? Usage:
 *  await db.insert(usersTable).values(user);
 */
