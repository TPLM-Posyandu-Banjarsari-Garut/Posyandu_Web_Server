import { z } from 'zod'

export const envSchema = z.object({
    NODE_ENV: z
        .enum(['development', 'test', 'production'])
        .default('development'),

    PORT: z.coerce.number().default(3000),

    LOG_LEVEL: z
        .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
        .default('info'),

    CORS_ORIGIN: z.url('Invalid CORS origin URL format'),

    TRUSTED_ORIGINS: z
        .string()
        .default('')
        .transform(val => (val ? val.split(',').map(url => url.trim()) : [])),

    DATABASE_URL: z.url('Invalid Database URL format'),

    BETTER_AUTH_SECRET: z.string().min(1, 'BETTER_AUTH_SECRET is required'),

    BETTER_AUTH_URL: z.url('Invalid BETTER_AUTH_URL format'),

    GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),

    GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),

    RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required'),

    SENDER_EMAIL: z.string().email('Invalid sender email format'),

    CONTACT_NAME: z.string().min(1, 'CONTACT_NAME is required'),
    CONTACT_WHATSAPP: z.string().url('Invalid WhatsApp URL format'),
    CONTACT_EMAIL: z
        .string()
        .email('Invalid contact email format')
        .min(1, 'CONTACT_EMAIL is required'),

    RATE_LIMIT_GLOBAL_WINDOW_MINUTES: z.coerce.number(),
    RATE_LIMIT_GLOBAL_MAX: z.coerce.number(),
    RATE_LIMIT_AUTH_WINDOW_MINUTES: z.coerce.number(),
    RATE_LIMIT_AUTH_MAX: z.coerce.number(),
    RATE_LIMIT_SIGNIN_WINDOW_MINUTES: z.coerce.number(),
    RATE_LIMIT_SIGNIN_MAX: z.coerce.number(),
    RATE_LIMIT_SIGNUP_WINDOW_MINUTES: z.coerce.number(),
    RATE_LIMIT_SIGNUP_MAX: z.coerce.number(),
    RATE_LIMIT_OTP_REQ_WINDOW_MINUTES: z.coerce.number(),
    RATE_LIMIT_OTP_REQ_MAX: z.coerce.number(),
    RATE_LIMIT_OTP_VERIFY_WINDOW_MINUTES: z.coerce.number(),
    RATE_LIMIT_OTP_VERIFY_MAX: z.coerce.number(),
    RATE_LIMIT_RESET_PWD_WINDOW_MINUTES: z.coerce.number(),
    RATE_LIMIT_RESET_PWD_MAX: z.coerce.number(),
    RATE_LIMIT_DELETE_ACC_WINDOW_MINUTES: z.coerce.number(),
    RATE_LIMIT_DELETE_ACC_MAX: z.coerce.number(),
    RATE_LIMIT_CHANGE_PWD_WINDOW_MINUTES: z.coerce.number(),
    RATE_LIMIT_CHANGE_PWD_MAX: z.coerce.number(),

    R2_ACCOUNT_ID: z.string().min(1, 'R2_ACCOUNT_ID is required'),
    R2_ACCESS_KEY_ID: z.string().min(1, 'R2_ACCESS_KEY_ID is required'),
    R2_SECRET_ACCESS_KEY: z.string().min(1, 'R2_SECRET_ACCESS_KEY is required'),
    R2_BUCKET_NAME: z.string().min(1, 'R2_BUCKET_NAME is required')
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
