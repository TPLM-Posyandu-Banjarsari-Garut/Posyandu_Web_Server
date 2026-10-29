import { formatDateId, labelConsultationType } from '../email-service'

describe('email formatting helpers', () => {
    it('formats dates in the configured Indonesian locale and time zone', () => {
        expect(formatDateId('2025-06-01T01:00:00.000Z')).toContain('Minggu')
        expect(formatDateId(new Date('2025-06-01T01:00:00.000Z'))).toContain(
            '08.00'
        )
    })

    it.each([
        ['pregnancy', 'Konsultasi Kehamilan'],
        ['child_development', 'Perkembangan Anak'],
        ['general', 'Konsultasi Umum'],
        ['custom', 'custom']
    ])('maps consultation type %s', (type, expected) => {
        expect(labelConsultationType(type)).toBe(expected)
    })
})
