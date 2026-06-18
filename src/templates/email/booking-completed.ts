import { getBaseTemplate, escapeHtml } from '@/templates/email/base-layout'

interface BookingCompletedProps {
    parentName: string
    consultationType: string
    posyanduName: string
    durationMinutes?: number
    followUpRequired?: boolean
    followUpDate?: string
    officerName?: string
}

export function bookingCompleted(props: BookingCompletedProps): string {
    const {
        parentName,
        consultationType,
        posyanduName,
        durationMinutes,
        followUpRequired,
        followUpDate,
        officerName
    } = props
    const contentHtml = `
        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px; font-weight: 600;">Konsultasi Selesai ✅</h2>
        <p>Halo, <strong>${escapeHtml(parentName)}</strong>,</p>
        <p>Konsultasi Anda telah berhasil diselesaikan. Terima kasih telah menggunakan layanan Posyandu Banjarsari.</p>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <table width="100%" style="font-size: 14px;">
                <tr><td style="color: #166534; padding: 4px 0;">Layanan</td><td style="font-weight: 600;">${escapeHtml(consultationType)}</td></tr>
                <tr><td style="color: #166534; padding: 4px 0;">Posyandu</td><td style="font-weight: 600;">${escapeHtml(posyanduName)}</td></tr>
                ${officerName ? `<tr><td style="color: #166534; padding: 4px 0;">Petugas</td><td style="font-weight: 600;">${escapeHtml(officerName)}</td></tr>` : ''}
                ${durationMinutes ? `<tr><td style="color: #166534; padding: 4px 0;">Durasi</td><td style="font-weight: 600;">${durationMinutes} menit</td></tr>` : ''}
            </table>
        </div>
        ${
            followUpRequired && followUpDate
                ? `
        <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin-top: 16px;">
            <p style="margin: 0; color: #92400e;"><strong>⚠️ Follow-up Diperlukan</strong><br>Anda dijadwalkan untuk kontrol ulang pada: <strong>${escapeHtml(followUpDate)}</strong></p>
        </div>`
                : ''
        }
        <p style="color: #64748b; font-size: 14px; margin-top: 24px;">Jaga kesehatan Anda dan keluarga. Kami selalu siap membantu.</p>
    `
    return getBaseTemplate('Konsultasi Selesai', contentHtml)
}
