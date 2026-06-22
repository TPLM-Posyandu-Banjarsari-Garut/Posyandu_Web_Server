import { Redis } from '@upstash/redis'
import { Store, ClientRateLimitInfo, Options } from 'express-rate-limit'
import env from '@/configs/env'

export const redis =
    env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
        ? new Redis({
              url: env.UPSTASH_REDIS_REST_URL,
              token: env.UPSTASH_REDIS_REST_TOKEN,
              retry: {
                  retries: 3,
                  backoff: retryCount => Math.min(retryCount * 200, 2000)
              }
          })
        : null

const CIRCUIT = {
    failures: 0,
    open: false,
    FAILURE_THRESHOLD: 5,
    RESET_AFTER_MS: 30_000
}

function recordFailure() {
    CIRCUIT.failures++
    if (CIRCUIT.failures >= CIRCUIT.FAILURE_THRESHOLD && !CIRCUIT.open) {
        CIRCUIT.open = true
        console.warn(
            '[Redis] Circuit breaker OPEN — Redis unreachable, using fallback'
        )
        setTimeout(() => {
            CIRCUIT.open = false
            CIRCUIT.failures = 0
            console.info('[Redis] Circuit breaker CLOSED — retrying Redis')
        }, CIRCUIT.RESET_AFTER_MS)
    }
}

function recordSuccess() {
    CIRCUIT.failures = 0
    if (CIRCUIT.open) {
        CIRCUIT.open = false
        console.info('[Redis] Circuit breaker CLOSED — Redis recovered')
    }
}

interface MemEntry {
    value: string
    expiresAt: number | null
}
const memCache = new Map<string, MemEntry>()

const mem = {
    get(key: string): string | null {
        const entry = memCache.get(key)
        if (!entry) return null
        if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
            memCache.delete(key)
            return null
        }
        return entry.value
    },
    set(key: string, value: string, ttlSeconds?: number): void {
        memCache.set(key, {
            value,
            expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null
        })
    },
    delete(key: string): void {
        memCache.delete(key)
    }
}

export const redisSecondaryStorage = redis
    ? {
          get: async (key: string): Promise<string | null> => {
              if (CIRCUIT.open) {
                  return mem.get(key)
              }
              try {
                  const result = await redis.get<string>(key)
                  recordSuccess()
                  if (result !== null) {
                      mem.set(key, result)
                  }
                  return result ?? mem.get(key)
              } catch {
                  recordFailure()
                  return mem.get(key)
              }
          },

          set: async (
              key: string,
              value: string,
              expiry?: number
          ): Promise<void> => {
              mem.set(key, value, expiry)

              if (CIRCUIT.open) return

              try {
                  if (expiry) {
                      await redis.set(key, value, { ex: expiry })
                  } else {
                      await redis.set(key, value)
                  }
                  recordSuccess()
              } catch {
                  recordFailure()
              }
          },

          delete: async (key: string): Promise<void> => {
              mem.delete(key)

              if (CIRCUIT.open) return

              try {
                  await redis.del(key)
                  recordSuccess()
              } catch {
                  recordFailure()
              }
          }
      }
    : undefined

export class UpstashRedisStore implements Store {
    private readonly client: Redis
    public readonly prefix: string
    private windowMs: number = 15 * 60 * 1000

    constructor(client: Redis, prefix: string = 'rl:') {
        this.client = client
        this.prefix = prefix
    }

    init(options: Options): void {
        this.windowMs = options.windowMs
    }

    async increment(key: string): Promise<ClientRateLimitInfo> {
        const now = Date.now()
        const windowStart = now - this.windowMs
        const fullKey = this.prefix + key
        const resetTime = new Date(now + this.windowMs)

        if (CIRCUIT.open) {
            return { totalHits: 1, resetTime }
        }

        try {
            const pipeline = this.client.pipeline()
            pipeline.zremrangebyscore(fullKey, 0, windowStart)
            pipeline.zadd(fullKey, {
                score: now,
                member: `${now}-${crypto.randomUUID()}`
            })
            pipeline.zcard(fullKey)
            pipeline.pexpire(fullKey, this.windowMs)

            const results = await pipeline.exec()
            recordSuccess()

            const totalHits = (results[2] as number) || 0
            return { totalHits, resetTime }
        } catch {
            recordFailure()
            return { totalHits: 1, resetTime }
        }
    }

    async decrement(key: string): Promise<void> {
        if (CIRCUIT.open) return
        try {
            await this.client.zremrangebyrank(this.prefix + key, -1, -1)
            recordSuccess()
        } catch {
            recordFailure()
        }
    }

    async resetKey(key: string): Promise<void> {
        if (CIRCUIT.open) return
        try {
            await this.client.del(this.prefix + key)
            recordSuccess()
        } catch {
            recordFailure()
        }
    }
}

export const createRateLimitStore = (prefix: string) =>
    redis ? new UpstashRedisStore(redis, prefix) : undefined
