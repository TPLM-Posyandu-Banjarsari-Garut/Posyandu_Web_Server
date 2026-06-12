import { getBaseTemplate } from '@/templates/email/base-layout'

export function passwordChanged(email: string): string {
    const contentHtml = `
        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px; font-weight: 600;">Kata Sandi Berhasil Diubah</h2>
        <p>Halo,</p>
        <p>Kata sandi untuk akun Sampurasun Posyandu Anda dengan email <strong>${email}</strong> telah berhasil diubah.</p>
        <div style="margin: 24px 0; padding: 16px; background-color: #f0fdf4; border-left: 4px solid #16a34a; border-radius: 4px; color: #15803d; font-size: 14px;">
            Jika Anda melakukan perubahan ini, tidak ada tindakan lebih lanjut yang diperlukan.
        </div>
        <p style="color: #e11d48; font-weight: 600;">PENTING:</p>
        <p style="color: #64748b; font-size: 14px;">Jika Anda merasa tidak melakukan perubahan kata sandi ini, harap segera hubungi admin atau gunakan fitur lupa sandi untuk memulihkan akun Anda.</p>
    `
    return getBaseTemplate('Kata Sandi Berhasil Diubah', contentHtml)
}
