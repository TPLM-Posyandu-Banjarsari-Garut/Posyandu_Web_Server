import { drizzle } from 'drizzle-orm/neon-serverless'
import { Pool, neonConfig } from '@neondatabase/serverless'
import ws from 'ws'
import env from '@/configs/env'

neonConfig.webSocketConstructor = ws

const pool = new Pool({
    connectionString: env.DATABASE_URL
})

const db = drizzle(pool, {
    logger: env.NODE_ENV === 'development'
})

export default db

/**
 * ? Usage:
 *  await db.insert(usersTable).values(user);
 */
