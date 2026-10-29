import { sanitizeSearchTerm } from '../sanitize'

describe('sanitizeSearchTerm', () => {
    it('removes SQL punctuation and comment markers', () => {
        expect(sanitizeSearchTerm("O'Reilly; --delete /x")).toBe(
            'OReilly delete x'
        )
    })

    it('escapes wildcard characters used by LIKE queries', () => {
        expect(sanitizeSearchTerm('100%_\\path')).toBe('100\\%\\_\\\\path')
    })

    it('limits search terms to 100 characters', () => {
        expect(sanitizeSearchTerm('x'.repeat(120))).toHaveLength(100)
    })
})
