import { getBaseTemplate, escapeHtml } from '@/templates/email/base-layout'

interface BookingCancellationProps {
    parentName: string
    consultationType: string
    scheduledAt: string
    posyanduName: string
    cancellationReason: string
    cancelledBy: 'parent' | 'officer'
}

export function bookingCancellation(props: BookingCancellationProps): string {
    const {
        parentName,
        consultationType,
        scheduledAt,
        posyanduName,
        cancellationReason,
        cancelledBy
    } = props
    const contentHtml = `
        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px; font-weight: 600;">Booking Konsultasi Dibatalkan ❌</h2>
        <p>Halo, <strong>${escapeHtml(parentName)}</strong>,</p>
        <p>Booking konsultasi Anda telah <strong>dibatalkan</strong>${cancelledBy === 'officer' ? ' oleh petugas Posyandu' : ''}.</p>
        <div style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <table width="100%" style="font-size: 14px;">
                <tr><td style="color: #9f1239; padding: 4px 0;">Jenis Layanan</td><td style="font-weight: 600;">${escapeHtml(consultationType)}</td></tr>
                <tr><td style="color: #9f1239; padding: 4px 0;">Jadwal</td><td style="font-weight: 600;">${escapeHtml(scheduledAt)}</td></tr>
                <tr><td style="color: #9f1239; padding: 4px 0;">Posyandu</td><td style="font-weight: 600;">${escapeHtml(posyanduName)}</td></tr>
                <tr><td style="color: #9f1239; padding: 4px 0;">Alasan</td><td style="font-weight: 600;">${escapeHtml(cancellationReason)}</td></tr>
            </table>
        </div>
        <p style="color: #64748b; font-size: 14px;">Anda dapat membuat booking baru kapan saja melalui aplikasi Sampurasun Posyandu.</p>
    `
    return getBaseTemplate('Booking Konsultasi Dibatalkan', contentHtml)
}
