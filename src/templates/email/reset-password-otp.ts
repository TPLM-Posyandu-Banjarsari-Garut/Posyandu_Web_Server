import { getBaseTemplate } from '@/templates/email/base-layout'

export function resetPasswordOTP(otp: string): string {
    const contentHtml = `
        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px; font-weight: 600;">Permintaan Reset Kata Sandi</h2>
        <p>Halo,</p>
        <p>Kami menerima permintaan untuk mereset kata sandi akun Sampurasun Posyandu Anda. Gunakan kode OTP berikut untuk melanjutkan proses reset:</p>
        <div style="text-align: center; margin: 32px 0;">
            <span style="display: inline-block; font-family: monospace; font-size: 36px; font-weight: 700; letter-spacing: 6px; padding: 12px 32px; background-color: #fff1f2; border: 2px dashed #fecdd3; border-radius: 8px; color: #be123c;">
                ${otp}
            </span>
        </div>
        <p style="color: #64748b; font-size: 14px;">Kode OTP ini rahasia dan berlaku terbatas. Jika Anda tidak meminta pengaturan ulang kata sandi ini, harap segera amankan akun Anda.</p>
    `
    return getBaseTemplate('Reset Kata Sandi', contentHtml)
}
