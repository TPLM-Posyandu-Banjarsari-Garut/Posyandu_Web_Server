import { Resend } from 'resend'
import env from '@/configs/env'
import { logger } from '@/utils/logger'
import { emailTemplates } from '@/templates/email'

const resend = new Resend(env.RESEND_API_KEY)

export class EmailService {
    /**
     * Shared sending mechanism
     */
    private static async sendMail(
        to: string,
        subject: string,
        html: string
    ): Promise<void> {
        try {
            await resend.emails.send({
                from: env.SENDER_EMAIL,
                to,
                subject,
                html
            })
            logger.info(
                `Email successfully sent to ${to} [Subject: ${subject}]`
            )
        } catch (error) {
            logger.error(
                error as Error,
                `Failed to send email to ${to} [Subject: ${subject}]`
            )
            throw error
        }
    }

    /**
     * Better-Auth generic handler adapter
     */
    static async sendVerificationOTP(
        email: string,
        otp: string,
        type:
            | 'sign-in'
            | 'email-verification'
            | 'forget-password'
            | 'change-email'
    ): Promise<void> {
        if (type === 'forget-password') {
            await this.sendResetPasswordOTP(email, otp)
        } else {
            // covers 'sign-in', 'email-verification', 'change-email'
            await this.sendEmailVerificationOTP(email, otp)
        }
    }

    /**
     * 1. Email Verification / Sign In / Email Change (OTP)
     */
    static async sendEmailVerificationOTP(
        email: string,
        otp: string
    ): Promise<void> {
        const html = emailTemplates.verificationOTP(otp)
        await this.sendMail(
            email,
            'Verifikasi Alamat Email - Sampurasun Posyandu',
            html
        )
    }

    /**
     * 2. Forgot Password / Reset Password Request (OTP)
     */
    static async sendResetPasswordOTP(
        email: string,
        otp: string
    ): Promise<void> {
        const html = emailTemplates.resetPasswordOTP(otp)
        await this.sendMail(
            email,
            'Permintaan Reset Kata Sandi - Sampurasun Posyandu',
            html
        )
    }

    /**
     * 3. Password Successfully Changed
     */
    static async sendPasswordChangedNotification(email: string): Promise<void> {
        const html = emailTemplates.passwordChanged(email)
        await this.sendMail(
            email,
            'Keamanan Akun: Kata Sandi Berhasil Diubah',
            html
        )
    }

    /**
     * 4. Login Alert (Opsional)
     */
    static async sendLoginAlert(
        email: string,
        details: { ipAddress?: string; userAgent?: string; time?: string }
    ): Promise<void> {
        const html = emailTemplates.loginAlert(email, details)
        await this.sendMail(
            email,
            'Pemberitahuan Masuk Baru - Sampurasun Posyandu',
            html
        )
    }

    /**
     * 5. Account Locked / Too Many Attempts
     */
    static async sendAccountLockedNotification(
        email: string,
        reason?: string
    ): Promise<void> {
        const html = emailTemplates.accountLocked(email, reason)
        await this.sendMail(
            email,
            'Keamanan Akun: Akun Dikunci Sementara',
            html
        )
    }
}
