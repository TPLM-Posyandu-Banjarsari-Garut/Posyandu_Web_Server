import { rateLimit } from 'express-rate-limit'
import { ApiError } from '@/utils/api-error'
import { STATUS_CODES } from '@/constants/status-codes'
import env from '@/configs/env'
import { createRateLimitStore } from '@/configs/redis'

export const rateLimiter = rateLimit({
    windowMs: env.RATE_LIMIT_GLOBAL_WINDOW_MINUTES * 60 * 1000,
    max: env.NODE_ENV === 'development' ? 99999 : env.RATE_LIMIT_GLOBAL_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    store: createRateLimitStore('rl:global:'),
    message: {
        success: false,
        message:
            'Too many requests from this IP, please try again after 15 minutes',
        status: 429
    },
    handler: (req, res, next, options) => {
        next(
            new ApiError(
                STATUS_CODES.TOO_MANY_REQUESTS,
                options.message.message
            )
        )
    }
})

export const authRateLimiter = rateLimit({
    windowMs: env.RATE_LIMIT_AUTH_WINDOW_MINUTES * 60 * 1000,
    max: env.NODE_ENV === 'development' ? 99999 : env.RATE_LIMIT_AUTH_MAX,
    store: createRateLimitStore('rl:auth:'),
    handler: (req, res, next, options) => {
        next(
            ApiError.tooManyRequests(
                'Too many login attempts, please try again after an hour'
            )
        )
    }
})

export const signinRateLimiter = rateLimit({
    windowMs: env.RATE_LIMIT_SIGNIN_WINDOW_MINUTES * 60 * 1000,
    max: env.NODE_ENV === 'development' ? 99999 : env.RATE_LIMIT_SIGNIN_MAX,
    store: createRateLimitStore('rl:signin:'),
    message: {
        success: false,
        message: 'Too many login attempts, please try again later.',
        statusCode: 429
    },
    standardHeaders: true,
    legacyHeaders: false
})

export const signupRateLimiter = rateLimit({
    windowMs: env.RATE_LIMIT_SIGNUP_WINDOW_MINUTES * 60 * 1000,
    max: env.NODE_ENV === 'development' ? 99999 : env.RATE_LIMIT_SIGNUP_MAX,
    store: createRateLimitStore('rl:signup:'),
    message: {
        success: false,
        message: 'Too many registration attempts, please try again later.',
        statusCode: 429
    },
    standardHeaders: true,
    legacyHeaders: false
})

export const otpRequestLimiter = rateLimit({
    windowMs: env.RATE_LIMIT_OTP_REQ_WINDOW_MINUTES * 60 * 1000,
    max: env.NODE_ENV === 'development' ? 99999 : env.RATE_LIMIT_OTP_REQ_MAX,
    store: createRateLimitStore('rl:otpreq:'),
    message: {
        success: false,
        message: 'Too many OTP requests. Please try again later.',
        statusCode: 429
    },
    standardHeaders: true,
    legacyHeaders: false
})

export const otpVerificationLimiter = rateLimit({
    windowMs: env.RATE_LIMIT_OTP_VERIFY_WINDOW_MINUTES * 60 * 1000,
    max: env.NODE_ENV === 'development' ? 99999 : env.RATE_LIMIT_OTP_VERIFY_MAX,
    store: createRateLimitStore('rl:otpverify:'),
    message: {
        success: false,
        message: 'Too many OTP verification attempts. Please try again later.',
        statusCode: 429
    },
    standardHeaders: true,
    legacyHeaders: false
})

export const resetPasswordLimiter = rateLimit({
    windowMs: env.RATE_LIMIT_RESET_PWD_WINDOW_MINUTES * 60 * 1000,
    max: env.NODE_ENV === 'development' ? 99999 : env.RATE_LIMIT_RESET_PWD_MAX,
    store: createRateLimitStore('rl:resetpwd:'),
    message: {
        success: false,
        message: 'Too many password reset attempts, please try again later.',
        statusCode: 429
    },
    standardHeaders: true,
    legacyHeaders: false
})

export const deleteAccountLimiter = rateLimit({
    windowMs: env.RATE_LIMIT_DELETE_ACC_WINDOW_MINUTES * 60 * 1000,
    max: env.NODE_ENV === 'development' ? 99999 : env.RATE_LIMIT_DELETE_ACC_MAX,
    store: createRateLimitStore('rl:delacc:'),
    message: {
        success: false,
        message: 'Too many account deletion attempts, please try again later.',
        statusCode: 429
    },
    standardHeaders: true,
    legacyHeaders: false
})

export const changePasswordLimiter = rateLimit({
    windowMs: env.RATE_LIMIT_CHANGE_PWD_WINDOW_MINUTES * 60 * 1000,
    max: env.NODE_ENV === 'development' ? 99999 : env.RATE_LIMIT_CHANGE_PWD_MAX,
    store: createRateLimitStore('rl:changepwd:'),
    message: {
        success: false,
        message: 'Too many password change attempts, please try again later.',
        statusCode: 429
    },
    standardHeaders: true,
    legacyHeaders: false
})

export const mediaUploadRateLimiter = rateLimit({
    windowMs: env.RATE_LIMIT_MEDIA_UPLOAD_WINDOW_MINUTES * 60 * 1000,
    max:
        env.NODE_ENV === 'development'
            ? 99999
            : env.RATE_LIMIT_MEDIA_UPLOAD_MAX,
    store: createRateLimitStore('rl:media:'),
    message: {
        success: false,
        message: 'Too many upload requests. Please try again later.',
        statusCode: 429
    },
    standardHeaders: true,
    legacyHeaders: false
})
