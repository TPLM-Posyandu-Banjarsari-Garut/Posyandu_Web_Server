import { getBaseTemplate, escapeHtml } from '@/templates/email/base-layout'

interface BookingQueueInfoProps {
    parentName: string
    consultationType: string
    scheduledAt: string
    posyanduName: string
    queueNumber: number
}

export function bookingQueueInfo(props: BookingQueueInfoProps): string {
    const {
        parentName,
        consultationType,
        scheduledAt,
        posyanduName,
        queueNumber
    } = props
    const contentHtml = `
        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px; font-weight: 600;">Booking Konsultasi Diterima</h2>
        <p>Halo, <strong>${escapeHtml(parentName)}</strong>,</p>
        <p>Booking konsultasi Anda telah berhasil dibuat dan sedang menunggu konfirmasi dari petugas Posyandu.</p>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <table width="100%" style="font-size: 14px;">
                <tr><td style="color: #64748b; padding: 4px 0;">Nomor Antrean</td><td style="font-weight: 700; color: #0f172a; font-size: 24px;">#${queueNumber}</td></tr>
                <tr><td style="color: #64748b; padding: 4px 0;">Jenis Layanan</td><td style="font-weight: 600;">${escapeHtml(consultationType)}</td></tr>
                <tr><td style="color: #64748b; padding: 4px 0;">Jadwal</td><td style="font-weight: 600;">${escapeHtml(scheduledAt)}</td></tr>
                <tr><td style="color: #64748b; padding: 4px 0;">Posyandu</td><td style="font-weight: 600;">${escapeHtml(posyanduName)}</td></tr>
                <tr><td style="color: #64748b; padding: 4px 0;">Status</td><td><span style="background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:4px;font-size:12px;font-weight:600;">MENUNGGU KONFIRMASI</span></td></tr>
            </table>
        </div>
        <p style="color: #64748b; font-size: 14px;">Anda akan mendapatkan email notifikasi ketika booking telah dikonfirmasi oleh petugas Posyandu.</p>
    `
    return getBaseTemplate('Booking Konsultasi Diterima', contentHtml)
}
