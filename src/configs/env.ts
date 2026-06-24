import { z } from 'zod'

const numeric = z.string().transform((val, ctx) => {
    const parsed = Number(val)
    if (Number.isNaN(parsed)) {
        ctx.addIssue({
            code: 'custom',
            message: 'Must be a valid number'
        })
        return z.NEVER
    }
    return parsed
})

export const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']),

    PORT: numeric,

    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']),

    CORS_ORIGIN: z.url('Invalid CORS origin URL format'),

    TRUSTED_ORIGINS: z
        .string()
        .transform(val => (val ? val.split(',').map(url => url.trim()) : [])),

    DATABASE_URL: z.url('Invalid Database URL format'),

    BETTER_AUTH_SECRET: z.string().min(1, 'BETTER_AUTH_SECRET is required'),

    BETTER_AUTH_URL: z.url('Invalid BETTER_AUTH_URL format'),

    GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),

    GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),

    RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required'),

    SENDER_EMAIL: z.string().email('Invalid sender email format'),

    CONTACT_NAME: z.string().min(1, 'CONTACT_NAME is required'),
    CONTACT_WHATSAPP: z
        .string()
        .url({ message: 'Invalid WhatsApp URL format' }),
    CONTACT_EMAIL: z
        .string()
        .email('Invalid contact email format')
        .min(1, 'CONTACT_EMAIL is required'),

    RATE_LIMIT_GLOBAL_WINDOW_MINUTES: numeric,
    RATE_LIMIT_GLOBAL_MAX: numeric,
    RATE_LIMIT_AUTH_WINDOW_MINUTES: numeric,
    RATE_LIMIT_AUTH_MAX: numeric,
    RATE_LIMIT_SIGNIN_WINDOW_MINUTES: numeric,
    RATE_LIMIT_SIGNIN_MAX: numeric,
    RATE_LIMIT_SIGNUP_WINDOW_MINUTES: numeric,
    RATE_LIMIT_SIGNUP_MAX: numeric,
    RATE_LIMIT_OTP_REQ_WINDOW_MINUTES: numeric,
    RATE_LIMIT_OTP_REQ_MAX: numeric,
    RATE_LIMIT_OTP_VERIFY_WINDOW_MINUTES: numeric,
    RATE_LIMIT_OTP_VERIFY_MAX: numeric,
    RATE_LIMIT_RESET_PWD_WINDOW_MINUTES: numeric,
    RATE_LIMIT_RESET_PWD_MAX: numeric,
    RATE_LIMIT_DELETE_ACC_WINDOW_MINUTES: numeric,
    RATE_LIMIT_DELETE_ACC_MAX: numeric,
    RATE_LIMIT_CHANGE_PWD_WINDOW_MINUTES: numeric,
    RATE_LIMIT_CHANGE_PWD_MAX: numeric,
    RATE_LIMIT_MEDIA_UPLOAD_WINDOW_MINUTES: numeric,
    RATE_LIMIT_MEDIA_UPLOAD_MAX: numeric,

    R2_ACCOUNT_ID: z.string().min(1, 'R2_ACCOUNT_ID is required'),
    R2_ACCESS_KEY_ID: z.string().min(1, 'R2_ACCESS_KEY_ID is required'),
    R2_SECRET_ACCESS_KEY: z.string().min(1, 'R2_SECRET_ACCESS_KEY is required'),
    R2_BUCKET_NAME: z.string().min(1, 'R2_BUCKET_NAME is required'),
    R2_PUBLIC_URL: z
        .string()
        .url({ message: 'Invalid R2_PUBLIC_URL format' })
        .optional(),

    MEDIA_UPLOAD_MAX_SIZE_MB: numeric,
    MEDIA_UPLOAD_MAX_RAW_SIZE_MB: numeric,
    MEDIA_UPLOAD_ALLOWED_EXTENSIONS: z
        .string()
        .transform(val => val.split(',').map(ext => ext.trim().toLowerCase())),

    UPSTASH_REDIS_REST_URL: z
        .string()
        .url({ message: 'Invalid Upstash Redis URL' })
        .optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
    UPSTASH_REDIS_URL: z.string().optional(),

    CRON_SECRET: z.string().min(1, 'CRON_SECRET is required'),
    SESSION_EXPIRES_IN: numeric,
    SESSION_UPDATE_AGE: numeric,
    SESSION_COOKIE_CACHE_ENABLED: z.string().transform(val => val === 'true'),
    SESSION_COOKIE_CACHE_MAX_AGE: numeric
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
