import { getBaseTemplate, escapeHtml } from '@/templates/email/base-layout'

export function accountLocked(email: string, reason?: string): string {
    const sanitizedReason = reason
        ? escapeHtml(reason)
        : 'Terlalu banyak percobaan masuk yang gagal (Too Many Login Attempts).'

    const contentHtml = `
        <h2 style="color: #be123c; margin-top: 0; font-size: 20px; font-weight: 600;">Akun Anda Telah Dikunci</h2>
        <p>Halo,</p>
        <p>Kami mendeteksi adanya beberapa kali kegagalan percobaan masuk ke akun Anda. Demi menjaga keamanan data Anda, akun Anda telah <strong>dikunci sementara</strong>.</p>
        <div style="margin: 24px 0; padding: 16px; background-color: #fef2f2; border-left: 4px solid #dc2626; border-radius: 4px; color: #991b1b; font-size: 14px;">
            <strong>Alasan Keamanan:</strong> ${sanitizedReason}
        </div>
        <p style="color: #64748b; font-size: 14px;">Anda dapat mencoba masuk kembali setelah masa penguncian selesai atau melakukan pemulihan akun melalui proses reset kata sandi.</p>
    `
    return getBaseTemplate('Akun Dikunci Sementara', contentHtml)
}
