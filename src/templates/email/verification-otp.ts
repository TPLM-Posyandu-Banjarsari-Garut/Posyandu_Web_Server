import { getBaseTemplate } from './base-layout'

export function verificationOTP(otp: string): string {
    const contentHtml = `
        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px; font-weight: 600;">Verifikasi Alamat Email Anda</h2>
        <p>Halo,</p>
        <p>Terima kasih telah mendaftar di Sampurasun Posyandu. Silakan gunakan Kode OTP di bawah ini untuk memverifikasi alamat email Anda:</p>
        <div style="text-align: center; margin: 32px 0;">
            <span style="display: inline-block; font-family: monospace; font-size: 36px; font-weight: 700; letter-spacing: 6px; padding: 12px 32px; background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 8px; color: #0f172a;">
                ${otp}
            </span>
        </div>
        <p style="color: #64748b; font-size: 14px;">Kode OTP ini hanya berlaku untuk waktu terbatas. Jika Anda tidak merasa melakukan pendaftaran ini, Anda dapat mengabaikan email ini dengan aman.</p>
    `
    return getBaseTemplate('Verifikasi Alamat Email', contentHtml)
}
