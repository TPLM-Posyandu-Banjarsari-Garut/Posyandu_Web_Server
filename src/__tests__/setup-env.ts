const rateLimitGroups = [
    'GLOBAL',
    'AUTH',
    'SIGNIN',
    'SIGNUP',
    'OTP_REQ',
    'OTP_VERIFY',
    'RESET_PWD',
    'DELETE_ACC',
    'CHANGE_PWD',
    'MEDIA_UPLOAD'
]

Object.assign(process.env, {
    NODE_ENV: 'test',
    PORT: '3000',
    LOG_LEVEL: 'fatal',
    CORS_ORIGIN: 'http://localhost:3000',
    TRUSTED_ORIGINS: 'http://localhost:3000',
    DATABASE_URL: 'postgresql://test:test@localhost:5432/posyandu_test',
    DATA_ENCRYPTION_KEY: 'a'.repeat(64),
    BETTER_AUTH_SECRET: 'test-secret-with-at-least-32-characters',
    BETTER_AUTH_URL: 'http://localhost:3000',
    GOOGLE_CLIENT_ID: 'test-client-id',
    GOOGLE_CLIENT_SECRET: 'test-client-secret',
    RESEND_API_KEY: 're_test_key',
    SENDER_EMAIL: 'noreply@example.com',
    CONTACT_NAME: 'Posyandu Test',
    CONTACT_WHATSAPP: 'https://wa.me/628000000000',
    CONTACT_EMAIL: 'contact@example.com',
    R2_ACCOUNT_ID: 'test-account',
    R2_ACCESS_KEY_ID: 'test-access-key',
    R2_SECRET_ACCESS_KEY: 'test-secret-key',
    R2_BUCKET_NAME: 'test-bucket',
    R2_PUBLIC_URL: 'http://localhost:9000/test-bucket',
    CLOUDFLARE_ACCOUNT_ID: '',
    CLOUDFLARE_API_TOKEN: '',
    CLOUDFLARE_KV_NAMESPACE_ID: '',
    MEDIA_UPLOAD_MAX_SIZE_MB: '10',
    MEDIA_UPLOAD_MAX_RAW_SIZE_MB: '20',
    MEDIA_UPLOAD_ALLOWED_EXTENSIONS: 'jpg,png,webp',
    CRON_SECRET: 'test-cron-secret',
    SESSION_EXPIRES_IN: '3600',
    SESSION_UPDATE_AGE: '300',
    SESSION_COOKIE_CACHE_ENABLED: 'false',
    SESSION_COOKIE_CACHE_MAX_AGE: '300'
})

for (const group of rateLimitGroups) {
    process.env[`RATE_LIMIT_${group}_WINDOW_MINUTES`] = '60'
    process.env[`RATE_LIMIT_${group}_MAX`] = '100'
}
