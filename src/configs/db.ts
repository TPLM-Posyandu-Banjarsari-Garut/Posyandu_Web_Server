import { drizzle } from 'drizzle-orm/neon-serverless'
import { Pool } from '@neondatabase/serverless'
import env from '@/configs/env'

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
