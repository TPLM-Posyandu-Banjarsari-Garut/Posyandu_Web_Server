import { z } from 'zod'

export const envSchema = z.object({
    NODE_ENV: z
        .enum(['development', 'test', 'production'])
        .default('development'),

    PORT: z.string().regex(/^\d+$/, 'PORT must be a number').transform(Number),

    LOG_LEVEL: z
        .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
        .default('info'),

    CORS_ORIGIN: z.url('Format Cors salah'),

    DATABASE_URL: z
        .url('Database URL Salah')
        .min(3, 'Database URL is required'),
    BETTER_AUTH_SECRET: z.string().nonempty('BETTER_AUTH_SECRET is required'),
    BETTER_AUTH_URL: z.url().nonempty('BETTER_AUTH_URL is required')
})

export type Env = z.infer<typeof envSchema>

const result = envSchema.safeParse(process.env)

if (!result.success) {
    console.error('❌ [Config Error] Invalid environment configuration:')
    console.error(z.prettifyError(result.error))
    process.exit(1)
}

export const env: Readonly<Env> = Object.freeze(result.data)

export default env
