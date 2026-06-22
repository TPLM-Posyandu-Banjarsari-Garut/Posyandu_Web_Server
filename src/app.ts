import express, { Express, Request, Response } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
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
import { STATUS_CODES } from '@/constants/status-codes'
sourceMapSupport.install()

const app: Express = express()

app.set('trust proxy', 1)

app.use(
    cors({
        origin: [env.CORS_ORIGIN, ...env.TRUSTED_ORIGINS],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        credentials: true
    })
)

app.use(
    express.json({
        limit: '50mb',
        verify: (
            req: import('node:http').IncomingMessage & { rawBody?: Buffer },
            _res,
            buf
        ) => {
            req.rawBody = buf
        }
    })
)
app.use(express.urlencoded({ extended: true, limit: '50mb' }))
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", 'https://unpkg.com'],
                scriptSrcElem: [
                    "'self'",
                    "'unsafe-inline'",
                    'https://unpkg.com'
                ],
                styleSrc: ["'self'", "'unsafe-inline'", 'https://unpkg.com'],
                styleSrcElem: [
                    "'self'",
                    "'unsafe-inline'",
                    'https://unpkg.com'
                ],
                imgSrc: ["'self'", 'data:'],
                connectSrc: ["'self'", 'https://unpkg.com'],
                fontSrc: ["'self'"],
                objectSrc: ["'none'"],
                frameAncestors: ["'none'"]
            }
        }
    })
)
app.use(cookieParser())

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

setupSwagger(app)

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

app.use('/api/auth', authRateLimiter)
app.all('/api/auth/*splat', toNodeHandler(auth))
app.get('/favicon.ico', (req, res) => res.status(204).end())

app.get('/', (req: Request, res: Response) => {
    res.redirect(env.NODE_ENV === 'development' ? '/api/docs' : '/api/health')
})

app.use(apiRoutes)

app.use(notFoundHandler)
app.use(errorHandler)

export default app
