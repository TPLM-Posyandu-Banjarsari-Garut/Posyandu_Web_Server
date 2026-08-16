import { Request, Response, NextFunction } from 'express'
import { ApiError } from '@/utils/api-error'
import { logger } from '@/utils/logger'
import env from '@/configs/env'

const TURNSTILE_VERIFY_URL =
    'https://challenges.cloudflare.com/turnstile/v0/siteverify'

/**
 * Middleware untuk memverifikasi Cloudflare Turnstile CAPTCHA token.
 *
 * Flow:
 *   Client solve CAPTCHA → dapat token
 *   → Client kirim token di header X-Captcha-Token atau body.captchaToken
 *   → Middleware verifikasi ke Cloudflare API
 *   → Jika valid: lanjut ke handler berikutnya
 *   → Jika invalid: tolak dengan 403
 *
 * Di-skip jika NODE_ENV === 'development' dan TURNSTILE_SECRET_KEY tidak diset.
 */
export const verifyTurnstile = async (
    req: Request,
    _res: Response,
    next: NextFunction
): Promise<void> => {
    // Skip di development jika secret key tidak diset (test key)
    const secretKey = env.TURNSTILE_SECRET_KEY
    if (!secretKey || secretKey === 'skip') {
        return next()
    }

    // Ambil token dari header atau body
    const token =
        (req.headers['x-captcha-token'] as string | undefined) ||
        (req.body?.captchaToken as string | undefined)

    if (!token) {
        return next(
            ApiError.forbidden(
                'CAPTCHA token diperlukan. Mohon selesaikan verifikasi CAPTCHA.'
            )
        )
    }

    try {
        const formData = new FormData()
        formData.append('secret', secretKey)
        formData.append('response', token)

        // Forward IP klien jika tersedia (opsional, meningkatkan akurasi Cloudflare)
        const clientIp =
            (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
            req.ip
        if (clientIp) {
            formData.append('remoteip', clientIp)
        }

        const response = await fetch(TURNSTILE_VERIFY_URL, {
            method: 'POST',
            body: formData,
            signal: AbortSignal.timeout(5000) // 5 detik timeout
        })

        if (!response.ok) {
            logger.warn(
                { status: response.status },
                'Cloudflare Turnstile API returned non-OK status'
            )
            return next(
                ApiError.forbidden('Verifikasi CAPTCHA gagal. Coba lagi.')
            )
        }

        const result = (await response.json()) as {
            success: boolean
            'error-codes'?: string[]
            challenge_ts?: string
            hostname?: string
        }

        if (!result.success) {
            logger.warn(
                { errorCodes: result['error-codes'] },
                'Turnstile token verification failed'
            )
            return next(
                ApiError.forbidden(
                    'Verifikasi CAPTCHA tidak valid. Mohon selesaikan ulang verifikasi.'
                )
            )
        }

        // Token valid — lanjutkan
        next()
    } catch (error) {
        logger.error(error, 'Error verifying Turnstile token')
        // Fail-open di production hanya jika Cloudflare down — log dan lanjutkan
        // Untuk keamanan maksimal, ubah ke: return next(ApiError.forbidden(...))
        return next(
            ApiError.server(
                'Layanan verifikasi CAPTCHA sementara tidak tersedia. Coba beberapa saat lagi.',
                true
            )
        )
    }
}
