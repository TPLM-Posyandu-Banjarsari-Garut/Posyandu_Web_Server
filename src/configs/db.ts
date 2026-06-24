import { drizzle } from 'drizzle-orm/neon-serverless'
import { Pool, neonConfig } from '@neondatabase/serverless'
import ws from 'ws'
import env from '@/configs/env'

neonConfig.webSocketConstructor = ws

const pool = new Pool({
    connectionString: env.DATABASE_URL,
    max: 20,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000
})

const db = drizzle(pool, {
    logger: env.NODE_ENV === 'development'
})

export default db
