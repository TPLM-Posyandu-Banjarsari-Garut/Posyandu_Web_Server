import { Request, Response, NextFunction } from 'express'
import { rateLimit, Options } from 'express-rate-limit'
import { ApiError } from '@/utils/api-error'
import { STATUS_CODES } from '@/constants/status-codes'
import env from '@/configs/env'
import { createRateLimitStore } from '@/configs/redis'

// ─── Helper: Consistent rate limit error handler ──────────────────────────────
const rateLimitHandler =
    (message: string) =>
    (
        _req: Request,
        _res: Response,
        next: NextFunction,
        _options: Options
    ): void => {
        next(new ApiError(STATUS_CODES.TOO_MANY_REQUESTS, message))
    }

// ─── 1. Global Rate Limiter ───────────────────────────────────────────────────
// Melindungi seluruh API dari traffic berlebihan
export const rateLimiter = rateLimit({
    windowMs: env.RATE_LIMIT_GLOBAL_WINDOW_MINUTES * 60 * 1000,
    max: env.NODE_ENV === 'development' ? 99999 : env.RATE_LIMIT_GLOBAL_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req: Request) => req.method === 'OPTIONS',
    store: createRateLimitStore('rl:global:'),
    handler: rateLimitHandler(
        'Terlalu banyak permintaan dari IP ini. Coba lagi setelah 15 menit.'
    )
})

// ─── 2. Auth Endpoint Rate Limiter ────────────────────────────────────────────
// Melindungi seluruh /api/auth/* dari abuse
export const authRateLimiter = rateLimit({
    windowMs: env.RATE_LIMIT_AUTH_WINDOW_MINUTES * 60 * 1000,
    max: env.NODE_ENV === 'development' ? 99999 : env.RATE_LIMIT_AUTH_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    store: createRateLimitStore('rl:auth:'),
    handler: rateLimitHandler(
        'Terlalu banyak percobaan autentikasi. Coba lagi setelah satu jam.'
    )
})

// ─── 3. Sign-In Rate Limiter ─────────────────────────────────────────────────
// Best practice: hanya menghitung percobaan GAGAL (skipSuccessfulRequests)
// Max 5 percobaan gagal per 15 menit per IP → anti brute-force
export const signinRateLimiter = rateLimit({
    windowMs: env.RATE_LIMIT_SIGNIN_WINDOW_MINUTES * 60 * 1000,
    max: env.NODE_ENV === 'development' ? 99999 : env.RATE_LIMIT_SIGNIN_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Hanya hitung percobaan gagal
    store: createRateLimitStore('rl:signin:'),
    handler: rateLimitHandler(
        'Terlalu banyak percobaan login. Akun sementara dikunci. Coba lagi nanti.'
    )
})

// ─── 4. Sign-Up Rate Limiter ─────────────────────────────────────────────────
// Batasi pendaftaran akun baru: max 3x per jam per IP
export const signupRateLimiter = rateLimit({
    windowMs: env.RATE_LIMIT_SIGNUP_WINDOW_MINUTES * 60 * 1000,
    max: env.NODE_ENV === 'development' ? 99999 : env.RATE_LIMIT_SIGNUP_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    store: createRateLimitStore('rl:signup:'),
    handler: rateLimitHandler(
        'Terlalu banyak percobaan pendaftaran. Coba lagi nanti.'
    )
})

// ─── 5. OTP Request Limiter ──────────────────────────────────────────────────
// Cegah spam OTP ke inbox email: max 3x per 10 menit per IP
export const otpRequestLimiter = rateLimit({
    windowMs: env.RATE_LIMIT_OTP_REQ_WINDOW_MINUTES * 60 * 1000,
    max: env.NODE_ENV === 'development' ? 99999 : env.RATE_LIMIT_OTP_REQ_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    store: createRateLimitStore('rl:otpreq:'),
    handler: rateLimitHandler(
        'Terlalu banyak permintaan OTP. Tunggu beberapa menit sebelum mencoba lagi.'
    )
})

// ─── 6. OTP Verification Limiter ─────────────────────────────────────────────
// Cegah brute-force kode OTP: max 5x per 10 menit per IP
export const otpVerificationLimiter = rateLimit({
    windowMs: env.RATE_LIMIT_OTP_VERIFY_WINDOW_MINUTES * 60 * 1000,
    max: env.NODE_ENV === 'development' ? 99999 : env.RATE_LIMIT_OTP_VERIFY_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    store: createRateLimitStore('rl:otpverify:'),
    handler: rateLimitHandler(
        'Terlalu banyak percobaan verifikasi OTP. Coba lagi nanti.'
    )
})

// ─── 7. Reset Password Limiter ───────────────────────────────────────────────
// Cegah spam reset password: max 3x per jam per IP
export const resetPasswordLimiter = rateLimit({
    windowMs: env.RATE_LIMIT_RESET_PWD_WINDOW_MINUTES * 60 * 1000,
    max: env.NODE_ENV === 'development' ? 99999 : env.RATE_LIMIT_RESET_PWD_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    store: createRateLimitStore('rl:resetpwd:'),
    handler: rateLimitHandler(
        'Terlalu banyak permintaan reset kata sandi. Coba lagi nanti.'
    )
})

// ─── 8. Delete Account Limiter ───────────────────────────────────────────────
export const deleteAccountLimiter = rateLimit({
    windowMs: env.RATE_LIMIT_DELETE_ACC_WINDOW_MINUTES * 60 * 1000,
    max: env.NODE_ENV === 'development' ? 99999 : env.RATE_LIMIT_DELETE_ACC_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    store: createRateLimitStore('rl:delacc:'),
    handler: rateLimitHandler(
        'Terlalu banyak percobaan penghapusan akun. Coba lagi nanti.'
    )
})

// ─── 9. Change Password Limiter ──────────────────────────────────────────────
export const changePasswordLimiter = rateLimit({
    windowMs: env.RATE_LIMIT_CHANGE_PWD_WINDOW_MINUTES * 60 * 1000,
    max: env.NODE_ENV === 'development' ? 99999 : env.RATE_LIMIT_CHANGE_PWD_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    store: createRateLimitStore('rl:changepwd:'),
    handler: rateLimitHandler(
        'Terlalu banyak percobaan pergantian kata sandi. Coba lagi nanti.'
    )
})

// ─── 10. Media Upload Limiter ─────────────────────────────────────────────────
export const mediaUploadRateLimiter = rateLimit({
    windowMs: env.RATE_LIMIT_MEDIA_UPLOAD_WINDOW_MINUTES * 60 * 1000,
    max:
        env.NODE_ENV === 'development'
            ? 99999
            : env.RATE_LIMIT_MEDIA_UPLOAD_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    store: createRateLimitStore('rl:media:'),
    handler: rateLimitHandler(
        'Terlalu banyak permintaan upload. Coba lagi nanti.'
    )
})
