import { Resend } from 'resend'
import env from '@/configs/env'
import { logger } from '@/utils/logger'
import { emailTemplates } from '@/templates/email'

const resend = new Resend(env.RESEND_API_KEY)

const FORMAT_ID = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Asia/Jakarta'
})

export function formatDateId(date: Date | string): string {
    return FORMAT_ID.format(new Date(date))
}

const CONSULTATION_TYPE_LABEL: Record<string, string> = {
    pregnancy: 'Konsultasi Kehamilan',
    child_development: 'Perkembangan Anak',
    general: 'Konsultasi Umum'
}

export function labelConsultationType(type: string): string {
    return CONSULTATION_TYPE_LABEL[type] ?? type
}

export class EmailService {
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
                error,
                `Failed to send email to ${to} [Subject: ${subject}]`
            )
            throw error
        }
    }

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
            await this.sendEmailVerificationOTP(email, otp)
        }
    }

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

    static async sendResetPasswordLink(
        email: string,
        url: string
    ): Promise<void> {
        const html = emailTemplates.resetPasswordLink(email, url)
        await this.sendMail(
            email,
            'Permintaan Reset Kata Sandi - Sampurasun Posyandu',
            html
        )
    }

    static async sendPasswordChangedNotification(email: string): Promise<void> {
        const html = emailTemplates.passwordChanged(email)
        await this.sendMail(
            email,
            'Keamanan Akun: Kata Sandi Berhasil Diubah',
            html
        )
    }

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

    static async sendBookingQueueInfo(
        email: string,
        params: {
            parentName: string
            consultationType: string
            scheduledAt: Date
            posyanduName: string
            queueNumber: number
        }
    ): Promise<void> {
        const html = emailTemplates.bookingQueueInfo({
            ...params,
            consultationType: labelConsultationType(params.consultationType),
            scheduledAt: formatDateId(params.scheduledAt)
        })
        await this.sendMail(
            email,
            'Booking Konsultasi Diterima - Sampurasun Posyandu',
            html
        )
    }

    static async sendBookingConfirmation(
        email: string,
        params: {
            parentName: string
            consultationType: string
            scheduledAt: Date
            posyanduName: string
            queueNumber: number
            officerName?: string
        }
    ): Promise<void> {
        const html = emailTemplates.bookingConfirmation({
            ...params,
            consultationType: labelConsultationType(params.consultationType),
            scheduledAt: formatDateId(params.scheduledAt)
        })
        await this.sendMail(
            email,
            'Booking Konsultasi Dikonfirmasi - Sampurasun Posyandu',
            html
        )
    }

    static async sendBookingCancellation(
        email: string,
        params: {
            parentName: string
            consultationType: string
            scheduledAt: Date
            posyanduName: string
            cancellationReason: string
            cancelledBy: 'parent' | 'officer'
        }
    ): Promise<void> {
        const html = emailTemplates.bookingCancellation({
            ...params,
            consultationType: labelConsultationType(params.consultationType),
            scheduledAt: formatDateId(params.scheduledAt)
        })
        await this.sendMail(
            email,
            'Booking Konsultasi Dibatalkan - Sampurasun Posyandu',
            html
        )
    }

    static async sendBookingRescheduled(
        email: string,
        params: {
            parentName: string
            consultationType: string
            oldScheduledAt: Date
            newScheduledAt: Date
            posyanduName: string
            queueNumber: number
        }
    ): Promise<void> {
        const html = emailTemplates.bookingRescheduled({
            ...params,
            consultationType: labelConsultationType(params.consultationType),
            oldScheduledAt: formatDateId(params.oldScheduledAt),
            newScheduledAt: formatDateId(params.newScheduledAt)
        })
        await this.sendMail(
            email,
            'Jadwal Konsultasi Diubah - Sampurasun Posyandu',
            html
        )
    }

    static async sendBookingCompleted(
        email: string,
        params: {
            parentName: string
            consultationType: string
            posyanduName: string
            durationMinutes?: number
            followUpRequired?: boolean
            followUpDate?: Date | null
            officerName?: string
        }
    ): Promise<void> {
        const html = emailTemplates.bookingCompleted({
            ...params,
            consultationType: labelConsultationType(params.consultationType),
            followUpDate: params.followUpDate
                ? formatDateId(params.followUpDate)
                : undefined
        })
        await this.sendMail(
            email,
            'Konsultasi Selesai - Sampurasun Posyandu',
            html
        )
    }

    static async sendBookingReminderH1(
        email: string,
        params: {
            parentName: string
            consultationType: string
            scheduledAt: Date
            posyanduName: string
            queueNumber: number
        }
    ): Promise<void> {
        const html = emailTemplates.bookingReminderH1({
            ...params,
            consultationType: labelConsultationType(params.consultationType),
            scheduledAt: formatDateId(params.scheduledAt)
        })
        await this.sendMail(
            email,
            '⏰ Pengingat: Konsultasi Besok! - Sampurasun Posyandu',
            html
        )
    }

    static async sendBookingReminder2h(
        email: string,
        params: {
            parentName: string
            consultationType: string
            scheduledAt: Date
            posyanduName: string
            queueNumber: number
        }
    ): Promise<void> {
        const html = emailTemplates.bookingReminder2h({
            ...params,
            consultationType: labelConsultationType(params.consultationType),
            scheduledAt: formatDateId(params.scheduledAt)
        })
        await this.sendMail(
            email,
            '🚨 Konsultasi 2 Jam Lagi! - Sampurasun Posyandu',
            html
        )
    }

    static async sendBookingFollowUpReminder(
        email: string,
        params: {
            parentName: string
            consultationType: string
            followUpDate: Date
            posyanduName: string
        }
    ): Promise<void> {
        const html = emailTemplates.bookingFollowUpReminder({
            ...params,
            consultationType: labelConsultationType(params.consultationType),
            followUpDate: formatDateId(params.followUpDate)
        })
        await this.sendMail(
            email,
            '🩺 Pengingat Kontrol Ulang - Sampurasun Posyandu',
            html
        )
    }
}
