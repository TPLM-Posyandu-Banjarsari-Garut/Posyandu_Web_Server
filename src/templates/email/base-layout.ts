export function getBaseTemplate(title: string, contentHtml: string): string {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title}</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 20px;">
                <tr>
                    <td align="center">
                        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.025); border: 1px solid #e2e8f0;">
                            <!-- Header -->
                            <tr>
                                <td style="background: linear-gradient(135deg, #0f172a, #1e293b); padding: 40px; text-align: center;">
                                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em;">Sampurasun Posyandu</h1>
                                </td>
                            </tr>
                            <!-- Body -->
                            <tr>
                                <td style="padding: 40px; color: #334155; font-size: 16px; line-height: 1.6;">
                                    ${contentHtml}
                                </td>
                            </tr>
                            <!-- Footer -->
                            <tr>
                                <td style="padding: 24px 40px; background-color: #f1f5f9; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
                                    <p style="margin: 0 0 8px 0;">Email ini dikirim secara otomatis oleh sistem keamanan Sampurasun Posyandu.</p>
                                    <p style="margin: 0;">&copy; 2026 Sampurasun Posyandu. Hak Cipta Dilindungi.</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `
}

export function escapeHtml(str: string): string {
    return str
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;')
}
