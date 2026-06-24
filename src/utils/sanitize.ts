export function sanitizeSearchTerm(input: string): string {
    if (!input) {
        return ''
    }
    let sanitized = input.replace(/[';"\-\-\/\*\+\=<>]/g, '')
    sanitized = sanitized.replace(/[%_\\]/g, '\\$&')
    return sanitized.slice(0, 100).trim()
}
