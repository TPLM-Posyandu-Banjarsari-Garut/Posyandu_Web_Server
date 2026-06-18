import { getBaseTemplate, escapeHtml } from '@/templates/email/base-layout'

interface BookingReminderH1Props {
    parentName: string
    consultationType: string
    scheduledAt: string
    posyanduName: string
    queueNumber: number
}

export function bookingReminderH1(props: BookingReminderH1Props): string {
    const {
        parentName,
        consultationType,
        scheduledAt,
        posyanduName,
        queueNumber
    } = props
    const contentHtml = `
        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px; font-weight: 600;">⏰ Pengingat: Konsultasi Besok!</h2>
        <p>Halo, <strong>${escapeHtml(parentName)}</strong>,</p>
        <p>Ini adalah pengingat bahwa Anda memiliki jadwal konsultasi <strong>besok</strong>. Jangan sampai terlewat!</p>
        <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <table width="100%" style="font-size: 14px;">
                <tr><td style="color: #92400e; padding: 4px 0;">Nomor Antrean</td><td style="font-weight: 700; color: #b45309; font-size: 24px;">#${queueNumber}</td></tr>
                <tr><td style="color: #92400e; padding: 4px 0;">Jenis Layanan</td><td style="font-weight: 600;">${escapeHtml(consultationType)}</td></tr>
                <tr><td style="color: #92400e; padding: 4px 0;">Jadwal</td><td style="font-weight: 600;">${escapeHtml(scheduledAt)}</td></tr>
                <tr><td style="color: #92400e; padding: 4px 0;">Posyandu</td><td style="font-weight: 600;">${escapeHtml(posyanduName)}</td></tr>
            </table>
        </div>
        <p style="color: #64748b; font-size: 14px;">Harap tiba 10 menit sebelum jadwal. Jika tidak bisa hadir, segera batalkan melalui aplikasi agar slot bisa digunakan orang lain.</p>
    `
    return getBaseTemplate('Pengingat Konsultasi Besok', contentHtml)
}
