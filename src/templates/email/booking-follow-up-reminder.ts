import { getBaseTemplate, escapeHtml } from '@/templates/email/base-layout'

interface BookingFollowUpReminderProps {
    parentName: string
    consultationType: string
    followUpDate: string
    posyanduName: string
}

export function bookingFollowUpReminder(
    props: BookingFollowUpReminderProps
): string {
    const { parentName, consultationType, followUpDate, posyanduName } = props
    const contentHtml = `
        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px; font-weight: 600;">🩺 Pengingat Kontrol Ulang</h2>
        <p>Halo, <strong>${escapeHtml(parentName)}</strong>,</p>
        <p>Dokter/petugas Posyandu menyarankan Anda untuk melakukan <strong>kontrol ulang besok</strong>.</p>
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <table width="100%" style="font-size: 14px;">
                <tr><td style="color: #1e40af; padding: 4px 0;">Tanggal Follow-up</td><td style="font-weight: 700; color: #1d4ed8; font-size: 18px;">${escapeHtml(followUpDate)}</td></tr>
                <tr><td style="color: #1e40af; padding: 4px 0;">Layanan</td><td style="font-weight: 600;">${escapeHtml(consultationType)}</td></tr>
                <tr><td style="color: #1e40af; padding: 4px 0;">Posyandu</td><td style="font-weight: 600;">${escapeHtml(posyanduName)}</td></tr>
            </table>
        </div>
        <p style="color: #64748b; font-size: 14px;">Silakan buat booking baru untuk kontrol ulang melalui aplikasi Sampurasun Posyandu. Kesehatan Anda adalah prioritas kami.</p>
    `
    return getBaseTemplate('Pengingat Kontrol Ulang', contentHtml)
}
