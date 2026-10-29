import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import env from '@/configs/env'

const pool = new Pool({
    connectionString: env.DATABASE_URL,
    max: env.DB_POOL_MAX,
    connectionTimeoutMillis: env.DB_POOL_CONNECTION_TIMEOUT_MS,
    idleTimeoutMillis: env.DB_POOL_IDLE_TIMEOUT_MS
})

const db = drizzle(pool, {
    logger: env.NODE_ENV === 'development'
})

export default db
