import { emailTemplates } from '../index'
import { escapeHtml, getBaseTemplate } from '../base-layout'

const booking = {
    parentName: 'A&B',
    consultationType: 'KIA',
    scheduledAt: '2025-06-01 08:00',
    posyanduName: 'Mawar',
    queueNumber: 4
}

describe('email templates', () => {
    it('renders a complete branded message for every registered template', () => {
        const outputs = [
            emailTemplates.verificationOTP('123456'),
            emailTemplates.resetPasswordOTP('234567'),
            emailTemplates.resetPasswordLink(
                'parent@example.com',
                'https://example.com/reset'
            ),
            emailTemplates.passwordChanged('parent@example.com'),
            emailTemplates.loginAlert('parent@example.com', {
                ipAddress: '127.0.0.1',
                userAgent: 'Test Browser',
                time: '2025-06-01 08:00'
            }),
            emailTemplates.accountLocked(
                'parent@example.com',
                'Too many attempts'
            ),
            emailTemplates.bookingQueueInfo(booking),
            emailTemplates.bookingConfirmation({
                ...booking,
                officerName: 'Bidan'
            }),
            emailTemplates.bookingCancellation({
                ...booking,
                cancellationReason: 'Jadwal berubah',
                cancelledBy: 'officer'
            }),
            emailTemplates.bookingRescheduled({
                ...booking,
                oldScheduledAt: '2025-06-01 08:00',
                newScheduledAt: '2025-06-02 09:00'
            }),
            emailTemplates.bookingReminderH1(booking),
            emailTemplates.bookingReminder2h(booking),
            emailTemplates.bookingCompleted({
                parentName: booking.parentName,
                consultationType: booking.consultationType,
                posyanduName: booking.posyanduName,
                durationMinutes: 20,
                followUpRequired: true,
                followUpDate: '2025-06-08',
                officerName: 'Bidan'
            }),
            emailTemplates.bookingFollowUpReminder({
                parentName: booking.parentName,
                consultationType: booking.consultationType,
                followUpDate: '2025-06-08',
                posyanduName: booking.posyanduName
            })
        ]

        expect(outputs).toHaveLength(14)
        for (const output of outputs) {
            expect(output).toContain('<!DOCTYPE html>')
            expect(output).toContain('Sampurasun Posyandu')
        }
        expect(outputs[6]).toContain('A&amp;B')
    })

    it('renders default and populated branches for optional email content', () => {
        const defaultLoginAlert = emailTemplates.loginAlert(
            'parent@example.com',
            {}
        )
        const detailedLoginAlert = emailTemplates.loginAlert(
            'parent@example.com',
            { ipAddress: '<script>', userAgent: 'Browser', time: 'now' }
        )
        const defaultLockReason =
            emailTemplates.accountLocked('parent@example.com')
        const customLockReason = emailTemplates.accountLocked(
            'parent@example.com',
            '<unsafe>'
        )
        const completedWithoutFollowUp = emailTemplates.bookingCompleted({
            parentName: 'Parent',
            consultationType: 'KIA',
            posyanduName: 'Mawar'
        })
        const completedWithFollowUp = emailTemplates.bookingCompleted({
            parentName: 'Parent',
            consultationType: 'KIA',
            posyanduName: 'Mawar',
            followUpRequired: true,
            followUpDate: '2025-06-08'
        })

        expect(defaultLoginAlert).toContain('Tidak diketahui')
        expect(detailedLoginAlert).toContain('&lt;script&gt;')
        expect(defaultLockReason).toContain('Too Many Login Attempts')
        expect(customLockReason).toContain('&lt;unsafe&gt;')
        expect(completedWithoutFollowUp).not.toContain('Follow-up Diperlukan')
        expect(completedWithFollowUp).toContain('Follow-up Diperlukan')
    })

    it('escapes HTML and composes the shared layout', () => {
        expect(escapeHtml(`<a x="'&">`)).toBe(
            '&lt;a x=&quot;&#039;&amp;&quot;&gt;'
        )
        expect(getBaseTemplate('Notice', '<p>Content</p>')).toContain(
            '<title>Notice</title>'
        )
    })
})
