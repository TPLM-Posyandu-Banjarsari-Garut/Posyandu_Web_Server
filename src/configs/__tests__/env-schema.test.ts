import { envSchema } from '../env'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('environment schema', () => {
    it('parses string configuration into typed numbers and lists', () => {
        const result = envSchema.safeParse(process.env)

        expect(result.success).toBe(true)
        if (!result.success) return

        expect(result.data.PORT).toBe(3000)
        expect(result.data.RATE_LIMIT_GLOBAL_MAX).toBe(100)
        expect(result.data.MEDIA_UPLOAD_ALLOWED_EXTENSIONS).toEqual([
            'jpg',
            'png',
            'webp'
        ])
        expect(result.data.CLOUDFLARE_KV_NAMESPACE_ID).toBe('')
    })

    it('rejects malformed URLs, encryption keys, and non-numeric limits', () => {
        const invalid = {
            ...process.env,
            DATABASE_URL: 'not-a-url',
            DATA_ENCRYPTION_KEY: 'too-short',
            RATE_LIMIT_GLOBAL_MAX: 'many'
        }

        expect(envSchema.safeParse(invalid).success).toBe(false)
    })

    it('rejects development secrets and insecure origins in production', () => {
        const result = envSchema.safeParse({
            ...process.env,
            NODE_ENV: 'production',
            BETTER_AUTH_SECRET: 'short',
            CORS_ORIGIN: 'http://api.example.test',
            BETTER_AUTH_URL: 'http://api.example.test',
            TURNSTILE_SECRET_KEY: 'skip'
        })

        expect(result.success).toBe(false)
        if (result.success) return

        expect(result.error.issues.map(issue => issue.path[0])).toEqual(
            expect.arrayContaining([
                'BETTER_AUTH_SECRET',
                'CSRF_SECRET',
                'TURNSTILE_SECRET_KEY',
                'CORS_ORIGIN',
                'BETTER_AUTH_URL'
            ])
        )
    })

    it('accepts deployment-specific secrets and HTTPS origins in production', () => {
        const result = envSchema.safeParse({
            ...process.env,
            NODE_ENV: 'production',
            BETTER_AUTH_SECRET: 'auth-secret-'.repeat(4),
            CORS_ORIGIN: 'https://api.example.test',
            BETTER_AUTH_URL: 'https://api.example.test',
            CSRF_SECRET: 'csrf-secret-'.repeat(6),
            TURNSTILE_SECRET_KEY: 'production-turnstile-secret',
            VAPID_PUBLIC_KEY: 'deployment-vapid-public-key',
            VAPID_PRIVATE_KEY: 'deployment-vapid-private-key'
        })

        expect(result.success).toBe(true)
    })

    it('requires both VAPID keys when web push is enabled in production', () => {
        const result = envSchema.safeParse({
            ...process.env,
            NODE_ENV: 'production',
            BETTER_AUTH_SECRET: 'auth-secret-'.repeat(4),
            CORS_ORIGIN: 'https://api.example.test',
            BETTER_AUTH_URL: 'https://api.example.test',
            CSRF_SECRET: 'csrf-secret-'.repeat(6),
            TURNSTILE_SECRET_KEY: 'production-turnstile-secret',
            VAPID_PUBLIC_KEY: 'deployment-vapid-public-key',
            VAPID_PRIVATE_KEY: ''
        })

        expect(result.success).toBe(false)
        if (result.success) return
        expect(result.error.issues[0]?.path).toEqual(['VAPID_PUBLIC_KEY'])
    })

    it('documents every required environment key in the example file', () => {
        const example = readFileSync(
            resolve(process.cwd(), '.env.example'),
            'utf8'
        )
        const values = Object.fromEntries(
            example
                .split('\n')
                .map(line => line.trim())
                .filter(line => line && !line.startsWith('#'))
                .map(line => {
                    const separator = line.indexOf('=')
                    return [line.slice(0, separator), line.slice(separator + 1)]
                })
        )
        const result = envSchema.safeParse(values)

        expect(result.success).toBe(false)
        if (result.success) return
        expect(result.error.issues.map(issue => issue.path[0])).toEqual([
            'DATA_ENCRYPTION_KEY'
        ])
    })
})
