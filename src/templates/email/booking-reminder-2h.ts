import { getBaseTemplate, escapeHtml } from '@/templates/email/base-layout'

interface BookingReminder2hProps {
    parentName: string
    consultationType: string
    scheduledAt: string
    posyanduName: string
    queueNumber: number
}

export function bookingReminder2h(props: BookingReminder2hProps): string {
    const {
        parentName,
        consultationType,
        scheduledAt,
        posyanduName,
        queueNumber
    } = props
    const contentHtml = `
        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px; font-weight: 600;">🚨 2 Jam Lagi! Segera Bersiap</h2>
        <p>Halo, <strong>${escapeHtml(parentName)}</strong>,</p>
        <p>Konsultasi Anda <strong>2 jam lagi</strong>. Segera bersiap dan perjalanan ke Posyandu.</p>
        <div style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <table width="100%" style="font-size: 14px;">
                <tr><td style="color: #9a3412; padding: 4px 0;">Nomor Antrean</td><td style="font-weight: 700; color: #c2410c; font-size: 28px;">#${queueNumber}</td></tr>
                <tr><td style="color: #9a3412; padding: 4px 0;">Waktu</td><td style="font-weight: 700; font-size: 18px;">${escapeHtml(scheduledAt)}</td></tr>
                <tr><td style="color: #9a3412; padding: 4px 0;">Layanan</td><td style="font-weight: 600;">${escapeHtml(consultationType)}</td></tr>
                <tr><td style="color: #9a3412; padding: 4px 0;">Posyandu</td><td style="font-weight: 600;">${escapeHtml(posyanduName)}</td></tr>
            </table>
        </div>
        <p style="color: #64748b; font-size: 14px;">Jika tidak bisa hadir, segera batalkan agar petugas dapat melayani pasien lain.</p>
    `
    return getBaseTemplate('Konsultasi 2 Jam Lagi', contentHtml)
}
