import { Redis } from '@upstash/redis'
import { Store, ClientRateLimitInfo, Options } from 'express-rate-limit'
import env from '@/configs/env'

export const redis =
    env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
        ? new Redis({
              url: env.UPSTASH_REDIS_REST_URL,
              token: env.UPSTASH_REDIS_REST_TOKEN
          })
        : null

export const redisSecondaryStorage = redis
    ? {
          get: async (key: string): Promise<string | null> => {
              const result = await redis.get<string>(key)
              return result
          },
          set: async (
              key: string,
              value: string,
              expiry?: number
          ): Promise<void> => {
              if (expiry) {
                  await redis.set(key, value, { ex: expiry })
              } else {
                  await redis.set(key, value)
              }
          },
          delete: async (key: string): Promise<void> => {
              await redis.del(key)
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

        const pipeline = this.client.pipeline()
        pipeline.zremrangebyscore(fullKey, 0, windowStart)
        pipeline.zadd(fullKey, {
            score: now,
            member: `${now}-${crypto.randomUUID()}`
        })
        pipeline.zcard(fullKey)
        pipeline.pexpire(fullKey, this.windowMs)

        const results = await pipeline.exec()
        const totalHits = (results[2] as number) || 0
        const resetTime = new Date(now + this.windowMs)

        return {
            totalHits,
            resetTime
        }
    }

    async decrement(key: string): Promise<void> {
        await this.client.zremrangebyrank(this.prefix + key, -1, -1)
    }

    async resetKey(key: string): Promise<void> {
        await this.client.del(this.prefix + key)
    }
}

export const createRateLimitStore = (prefix: string) =>
    redis ? new UpstashRedisStore(redis, prefix) : undefined
