import { getBaseTemplate, escapeHtml } from './base-layout'

export function loginAlert(
    email: string,
    details: { ipAddress?: string; userAgent?: string; time?: string }
): string {
    const formattedTime = details.time
        ? escapeHtml(details.time)
        : new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
    const formattedIp = details.ipAddress
        ? escapeHtml(details.ipAddress)
        : 'Tidak diketahui'
    const formattedUserAgent = details.userAgent
        ? escapeHtml(details.userAgent)
        : 'Tidak diketahui'

    const contentHtml = `
        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px; font-weight: 600;">Pemberitahuan Masuk Baru</h2>
        <p>Halo,</p>
        <p>Kami mendeteksi aktivitas masuk baru pada akun Sampurasun Posyandu Anda:</p>
        <table width="100%" border="0" cellspacing="0" cellpadding="8" style="background-color: #f8fafc; border-radius: 8px; margin: 16px 0; font-size: 14px; border: 1px solid #e2e8f0;">
            <tr>
                <td width="30%" style="font-weight: 600; color: #475569;">Waktu:</td>
                <td style="color: #0f172a;">${formattedTime}</td>
            </tr>
            <tr>
                <td style="font-weight: 600; color: #475569;">Alamat IP:</td>
                <td style="color: #0f172a;">${formattedIp}</td>
            </tr>
            <tr>
                <td style="font-weight: 600; color: #475569;">Perangkat:</td>
                <td style="color: #0f172a;">${formattedUserAgent}</td>
            </tr>
        </table>
        <p style="color: #64748b; font-size: 14px;">Jika ini adalah Anda, silakan abaikan email ini. Namun jika ini bukan aktivitas Anda, harap segera ubah kata sandi Anda untuk menjaga keamanan akun.</p>
    `
    return getBaseTemplate('Notifikasi Login Baru', contentHtml)
}
