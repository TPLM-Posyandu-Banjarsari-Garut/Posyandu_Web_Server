import { getBaseTemplate } from '@/templates/email/base-layout'

export function resetPasswordLink(email: string, url: string): string {
    const contentHtml = `
        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px; font-weight: 600;">Atur Ulang Kata Sandi</h2>
        <p>Halo,</p>
        <p>Kami menerima permintaan untuk mengatur ulang kata sandi akun Sampurasun Posyandu Anda. Silakan klik tombol di bawah ini untuk melanjutkan:</p>
        <div style="text-align: center; margin: 32px 0;">
            <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #be123c; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(190, 18, 60, 0.2);">
                Atur Ulang Kata Sandi
            </a>
        </div>
        <p style="color: #64748b; font-size: 14px; margin-top: 24px;">Jika tombol di atas tidak berfungsi, Anda juga dapat menyalin dan menempelkan tautan berikut ke browser Anda:</p>
        <p style="color: #be123c; font-size: 14px; word-break: break-all; font-family: monospace;">${url}</p>
        <p style="color: #64748b; font-size: 14px; margin-top: 24px;">Tautan ini rahasia dan berlaku terbatas. Jika Anda tidak meminta pengaturan ulang kata sandi ini, harap segera abaikan email ini.</p>
    `
    return getBaseTemplate('Atur Ulang Kata Sandi', contentHtml)
}
