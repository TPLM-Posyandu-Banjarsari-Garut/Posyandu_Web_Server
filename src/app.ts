import express, { Express, Request, Response } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import { doubleCsrf } from 'csrf-csrf'
import { notFoundHandler } from '@/middlewares/not-found-handler'
import { errorHandler } from '@/middlewares/error-handler'
import { setupSwagger } from '@/configs/swagger'
import apiRoutes from '@/routes/index-routes'
import env from '@/configs/env'
import sourceMapSupport from 'source-map-support'
import { toNodeHandler, fromNodeHeaders } from 'better-auth/node'
import { auth } from '@/configs/auth'
import { autoAuditMiddleware } from '@/middlewares/auto-audit-middleware'
import { authRateLimiter } from '@/middlewares/rate-limiter'
import { AsyncHandler } from '@/utils/async-handler'
import { ApiResponse } from '@/utils/api-response'
import { ApiError } from '@/utils/api-error'
import { STATUS_CODES } from '@/constants/status-codes'
import { verifyTurnstile } from '@/middlewares/verify-turnstile'
sourceMapSupport.install()

const app: Express = express()

// ─── Trust Proxy ─────────────────────────────────────────────────────────────
// trust proxy 1: untuk Nginx / Vercel / Cloudflare
app.set('trust proxy', 1)

// ─── CORS ─────────────────────────────────────────────────────────────────────
const corsOrigins = [env.CORS_ORIGIN, ...env.TRUSTED_ORIGINS]
if (
    env.NODE_ENV === 'development' ||
    env.CORS_ORIGIN.includes('localhost') ||
    env.CORS_ORIGIN.includes('127.0.0.1')
) {
    corsOrigins.push('http://localhost:3001')
}

app.use(
    cors({
        origin: corsOrigins,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-Requested-With',
            'X-CSRF-Token',
            'X-Captcha-Token'
        ],
        credentials: true
    })
)

// ─── Body Parsers ─────────────────────────────────────────────────────────────
app.use(
    express.json({
        limit: '10mb', // Turun dari 50mb — lebih aman
        verify: (
            req: import('node:http').IncomingMessage & { rawBody?: Buffer },
            _res,
            buf
        ) => {
            req.rawBody = buf
        }
    })
)
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

// ─── Helmet — Security Headers ────────────────────────────────────────────────
const isProduction = env.NODE_ENV === 'production'

app.use(
    helmet({
        // HSTS: Paksa browser gunakan HTTPS selama 1 tahun, termasuk subdomain
        hsts: isProduction
            ? {
                  maxAge: 31536000, // 1 tahun
                  includeSubDomains: true,
                  preload: true
              }
            : false,

        // Cegah MIME sniffing
        xContentTypeOptions: true,

        // Anti-clickjacking (legacy support selain frameAncestors di CSP)
        frameguard: { action: 'deny' },

        // Kebijakan Referrer: hanya kirim origin saat cross-origin
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' },

        // Nonaktifkan X-Powered-By: Express header
        hidePoweredBy: true,

        // Batasi cross-domain policy
        permittedCrossDomainPolicies: { permittedPolicies: 'none' },

        // CSP — Content Security Policy
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],

                // Script: Tidak ada unsafe-inline di production. Swagger butuh unsafe-inline di dev.
                scriptSrc: isProduction
                    ? ["'self'", 'https://unpkg.com']
                    : [
                          "'self'",
                          "'unsafe-inline'",
                          "'unsafe-eval'",
                          'https://unpkg.com'
                      ],

                scriptSrcElem: isProduction
                    ? ["'self'", 'https://unpkg.com']
                    : ["'self'", "'unsafe-inline'", 'https://unpkg.com'],

                // Style: unsafe-inline diizinkan karena Swagger UI membutuhkannya
                styleSrc: ["'self'", "'unsafe-inline'", 'https://unpkg.com'],
                styleSrcElem: [
                    "'self'",
                    "'unsafe-inline'",
                    'https://unpkg.com'
                ],

                // Gambar: izinkan self, data URI, dan CDN eksternal (R2 bucket, avatar)
                imgSrc: ["'self'", 'data:', 'blob:', 'https:'],

                // Koneksi API
                connectSrc: ["'self'"],

                // Font
                fontSrc: ["'self'", 'https://unpkg.com'],

                // Larang object/embed/plugin
                objectSrc: ["'none'"],

                // Anti-clickjacking di CSP level
                frameAncestors: ["'none'"],

                // Form hanya boleh submit ke domain sendiri
                formAction: ["'self'"],

                // Base URI hanya self (cegah base tag injection)
                baseUri: ["'self'"],

                // Paksa HTTPS di production
                ...(isProduction && {
                    upgradeInsecureRequests: []
                })
            }
        }
    })
)

// ─── Permissions-Policy ───────────────────────────────────────────────────────
// Helm tidak punya Permissions-Policy bawaan, set manual
app.use((_req, res, next) => {
    res.setHeader(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()'
    )
    next()
})

// ─── CSRF Protection (csrf-csrf — Double Submit Cookie) ───────────────────────
// Melindungi semua endpoint mutasi (POST, PUT, PATCH, DELETE) dari serangan CSRF.
// BetterAuth (/api/auth/*) sudah punya proteksi origin-based sendiri → di-skip.
const { doubleCsrfProtection, generateCsrfToken } = doubleCsrf({
    getSecret: () => env.CSRF_SECRET!,
    getSessionIdentifier: (req: Request) => {
        return (
            (req.cookies?.['better-auth.session_token'] as string) ||
            (req.cookies?.['__Secure-better-auth.session_token'] as string) ||
            'posyandu-client-session'
        )
    },
    cookieName: 'csrf-token',
    cookieOptions: {
        httpOnly: true,
        sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
        secure: env.NODE_ENV === 'production',
        path: '/'
    },
    getCsrfTokenFromRequest: (req: Request) => {
        // Cari token di header X-CSRF-Token atau di body._csrf
        return (
            (req.headers['x-csrf-token'] as string | undefined) ||
            (req.body?._csrf as string | undefined)
        )
    }
})

// Endpoint khusus untuk mendapatkan CSRF token (dipanggil client saat load halaman form)
app.get('/api/csrf-token', (req: Request, res: Response) => {
    const token = generateCsrfToken(req, res)
    res.json({ csrfToken: token })
})

// Terapkan CSRF protection pada semua route KECUALI:
// - /api/auth/* (ditangani BetterAuth dengan origin check)
// - GET/HEAD/OPTIONS (idempotent, tidak perlu CSRF)
app.use((req: Request, res: Response, next) => {
    const isSafeMethod = ['GET', 'HEAD', 'OPTIONS'].includes(req.method)
    const isBetterAuthRoute = req.path.startsWith('/api/auth/')
    const isHealthRoute = req.path.startsWith('/api/health')

    if (isSafeMethod || isBetterAuthRoute || isHealthRoute) {
        return next()
    }

    // Terapkan CSRF check untuk semua mutasi di luar /api/auth/
    doubleCsrfProtection(req, res, err => {
        if (err) {
            return next(
                new ApiError(
                    STATUS_CODES.FORBIDDEN,
                    'Permintaan ditolak: Token CSRF tidak valid atau kedaluwarsa.'
                )
            )
        }
        next()
    })
})

// ─── Logger ───────────────────────────────────────────────────────────────────
morgan.token('user', (req: Request, res: Response) => {
    const user = res.locals?.user
    return user ? `${user.email} (${user.id})` : 'anonymous'
})

const morganFormat =
    env.NODE_ENV === 'development'
        ? '[:date[iso]] :method :url :status :response-time ms - :res[content-length] | User: :user'
        : ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" | User: :user'

app.use(morgan(morganFormat))
app.use(autoAuditMiddleware)

// ─── Swagger (dev only) ───────────────────────────────────────────────────────
setupSwagger(app)

// ─── Session Endpoint ─────────────────────────────────────────────────────────
app.get(
    '/api/auth/me',
    AsyncHandler(async (req: Request, res: Response) => {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers)
        })

        if (!session) {
            return ApiResponse.error(
                res,
                'Unauthorized',
                STATUS_CODES.UNAUTHORIZED
            )
        }

        return ApiResponse.ok(res, 'Session retrieved successfully', {
            session: session.session,
            user: session.user
        })
    })
)

// ─── Auth Routes (BetterAuth) ─────────────────────────────────────────────────
app.use('/api/auth', authRateLimiter)

// Turnstile CAPTCHA verification hanya pada endpoint login & registrasi
// (sebelum BetterAuth handler)
app.post('/api/auth/sign-in/email', verifyTurnstile)
app.post('/api/auth/sign-up/email', verifyTurnstile)

app.all('/api/auth/*splat', toNodeHandler(auth))
app.get('/favicon.ico', (req, res) => res.status(204).end())

// ─── Root Redirect ────────────────────────────────────────────────────────────
app.get('/', (req: Request, res: Response) => {
    res.redirect(env.NODE_ENV === 'development' ? '/api/docs' : '/api/health')
})

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use(apiRoutes)

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFoundHandler)
app.use(errorHandler)

export default app
