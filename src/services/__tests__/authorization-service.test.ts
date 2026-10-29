import type { User } from '@/db'
import { AuthorizationService } from '../authorization-service'

const service = new AuthorizationService()

function user(role: string, id = 'user-1') {
    return { id, role } as User
}

describe('AuthorizationService pure authorization rules', () => {
    it('allows users to access themselves and administrators to access others', () => {
        expect(service.canAccessUser(user('parent'), 'user-1')).toBe(true)
        expect(service.canAccessUser(user('posyandu_admin'), 'user-2')).toBe(
            true
        )
        expect(service.canAccessUser(user('village_admin'), 'user-2')).toBe(
            true
        )
    })

    it('denies access to another account for non-admin users', () => {
        expect(service.canAccessUser(user('midwife'), 'user-2')).toBe(false)
        expect(service.canAccessUser(user('cadre'), 'user-2')).toBe(false)
        expect(service.canAccessUser(user('parent'), 'user-2')).toBe(false)
    })

    it('checks cadre and midwife assignments before scoped operations', () => {
        const midwife = {
            role: 'midwife',
            posyandu_ids: ['posyandu-1'],
            posyandu_assignments: [
                { id: 'assignment-1', posyandu_id: 'posyandu-1' }
            ]
        }

        expect(() =>
            service.requireAssignedPosyandu(midwife as never, 'posyandu-1')
        ).not.toThrow()
        expect(() =>
            service.requireAssignedPosyandu(midwife as never, 'posyandu-2')
        ).toThrow('You do not have access to this Posyandu')
        expect(service.getAssignmentId(midwife as never, 'posyandu-1')).toBe(
            'assignment-1'
        )
        expect(
            service.getAssignmentId(user('parent') as never, 'posyandu-1')
        ).toBeUndefined()
    })
})
