import * as enums from '../enum'
import {
    EXAMINATION_SLOTS,
    GENERAL_CONSULTATION_SLOTS
} from '../booking-schedules'
import { STATUS_CODES } from '../status-codes'

describe('domain constants', () => {
    it('defines valid domain enum values and Drizzle enums', () => {
        expect(enums.ACCOUNT_ROLE_VALUES).toContain('parent')
        expect(enums.CONSULTATION_STATUS_VALUES).toEqual(
            expect.arrayContaining(['pending', 'confirmed', 'completed'])
        )
        expect(enums.accountRoleEnum.enumValues).toEqual(
            enums.ACCOUNT_ROLE_VALUES
        )
    })

    it('keeps appointment slot lists sorted and distinct', () => {
        for (const slots of [GENERAL_CONSULTATION_SLOTS, EXAMINATION_SLOTS]) {
            expect(new Set(slots).size).toBe(slots.length)
            expect([...slots].sort()).toEqual(slots)
        }
    })

    it('exposes standard HTTP status codes', () => {
        expect(STATUS_CODES.OK).toBe(200)
        expect(STATUS_CODES.CREATED).toBe(201)
        expect(STATUS_CODES.UNAUTHORIZED).toBe(401)
        expect(STATUS_CODES.INTERNAL_SERVER_ERROR).toBe(500)
    })
})
