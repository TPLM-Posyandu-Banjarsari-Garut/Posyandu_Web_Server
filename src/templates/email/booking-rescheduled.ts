import { getBaseTemplate, escapeHtml } from '@/templates/email/base-layout'

interface BookingRescheduledProps {
    parentName: string
    consultationType: string
    oldScheduledAt: string
    newScheduledAt: string
    posyanduName: string
    queueNumber: number
}

export function bookingRescheduled(props: BookingRescheduledProps): string {
    const {
        parentName,
        consultationType,
        oldScheduledAt,
        newScheduledAt,
        posyanduName,
        queueNumber
    } = props
    const contentHtml = `
        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px; font-weight: 600;">Jadwal Konsultasi Diubah 📅</h2>
        <p>Halo, <strong>${escapeHtml(parentName)}</strong>,</p>
        <p>Jadwal konsultasi Anda telah berhasil diubah. Berikut detail perubahan jadwal:</p>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <table width="100%" style="font-size: 14px;">
                <tr><td style="color: #64748b; padding: 4px 0;">Nomor Antrean</td><td style="font-weight: 700; color: #0f172a; font-size: 24px;">#${queueNumber}</td></tr>
                <tr><td style="color: #64748b; padding: 4px 0;">Layanan</td><td style="font-weight: 600;">${escapeHtml(consultationType)}</td></tr>
                <tr><td style="color: #64748b; padding: 4px 0;">Jadwal Lama</td><td style="font-weight: 600; text-decoration: line-through; color: #94a3b8;">${escapeHtml(oldScheduledAt)}</td></tr>
                <tr><td style="color: #64748b; padding: 4px 0;">Jadwal Baru</td><td style="font-weight: 700; color: #16a34a;">${escapeHtml(newScheduledAt)}</td></tr>
                <tr><td style="color: #64748b; padding: 4px 0;">Posyandu</td><td style="font-weight: 600;">${escapeHtml(posyanduName)}</td></tr>
                <tr><td style="color: #64748b; padding: 4px 0;">Status</td><td><span style="background:#dbeafe;color:#1e40af;padding:2px 8px;border-radius:4px;font-size:12px;font-weight:600;">DIJADWAL ULANG</span></td></tr>
            </table>
        </div>
        <p style="color: #64748b; font-size: 14px;">Perubahan jadwal memerlukan konfirmasi ulang dari petugas Posyandu.</p>
    `
    return getBaseTemplate('Jadwal Konsultasi Diubah', contentHtml)
}
