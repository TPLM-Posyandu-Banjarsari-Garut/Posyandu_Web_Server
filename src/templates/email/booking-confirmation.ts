import { getBaseTemplate, escapeHtml } from '@/templates/email/base-layout'

interface BookingConfirmationProps {
    parentName: string
    consultationType: string
    scheduledAt: string
    posyanduName: string
    queueNumber: number
    officerName?: string
}

export function bookingConfirmation(props: BookingConfirmationProps): string {
    const {
        parentName,
        consultationType,
        scheduledAt,
        posyanduName,
        queueNumber,
        officerName
    } = props
    const contentHtml = `
        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px; font-weight: 600;">Booking Konsultasi Dikonfirmasi ✅</h2>
        <p>Halo, <strong>${escapeHtml(parentName)}</strong>,</p>
        <p>Kabar baik! Booking konsultasi Anda telah <strong>dikonfirmasi</strong> oleh petugas Posyandu. Silakan hadir sesuai jadwal.</p>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <table width="100%" style="font-size: 14px;">
                <tr><td style="color: #166534; padding: 4px 0;">Nomor Antrean</td><td style="font-weight: 700; color: #15803d; font-size: 24px;">#${queueNumber}</td></tr>
                <tr><td style="color: #166534; padding: 4px 0;">Jenis Layanan</td><td style="font-weight: 600;">${escapeHtml(consultationType)}</td></tr>
                <tr><td style="color: #166534; padding: 4px 0;">Jadwal</td><td style="font-weight: 600;">${escapeHtml(scheduledAt)}</td></tr>
                <tr><td style="color: #166534; padding: 4px 0;">Posyandu</td><td style="font-weight: 600;">${escapeHtml(posyanduName)}</td></tr>
                ${officerName ? `<tr><td style="color: #166534; padding: 4px 0;">Petugas</td><td style="font-weight: 600;">${escapeHtml(officerName)}</td></tr>` : ''}
                <tr><td style="color: #166534; padding: 4px 0;">Status</td><td><span style="background:#dcfce7;color:#166534;padding:2px 8px;border-radius:4px;font-size:12px;font-weight:600;">DIKONFIRMASI</span></td></tr>
            </table>
        </div>
        <p style="color: #64748b; font-size: 14px;">Harap tiba 10 menit sebelum jadwal. Jika tidak bisa hadir, segera batalkan booking melalui aplikasi.</p>
    `
    return getBaseTemplate('Booking Konsultasi Dikonfirmasi', contentHtml)
}
