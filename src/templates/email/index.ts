import { verificationOTP } from './verification-otp'
import { resetPasswordOTP } from './reset-password-otp'
import { resetPasswordLink } from './reset-password-link'
import { passwordChanged } from './password-changed'
import { loginAlert } from './login-alert'
import { accountLocked } from './account-locked'
import { bookingQueueInfo } from './booking-queue-info'
import { bookingConfirmation } from './booking-confirmation'
import { bookingCancellation } from './booking-cancellation'
import { bookingRescheduled } from './booking-rescheduled'
import { bookingReminderH1 } from './booking-reminder-h1'
import { bookingReminder2h } from './booking-reminder-2h'
import { bookingCompleted } from './booking-completed'
import { bookingFollowUpReminder } from './booking-follow-up-reminder'

export const emailTemplates = {
    verificationOTP,
    resetPasswordOTP,
    resetPasswordLink,
    passwordChanged,
    loginAlert,
    accountLocked,
    bookingQueueInfo,
    bookingConfirmation,
    bookingCancellation,
    bookingRescheduled,
    bookingReminderH1,
    bookingReminder2h,
    bookingCompleted,
    bookingFollowUpReminder
}
export default emailTemplates
