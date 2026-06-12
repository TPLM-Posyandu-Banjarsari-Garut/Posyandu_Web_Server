import { verificationOTP } from './verification-otp'
import { resetPasswordOTP } from './reset-password-otp'
import { resetPasswordLink } from './reset-password-link'
import { passwordChanged } from './password-changed'
import { loginAlert } from './login-alert'
import { accountLocked } from './account-locked'

export const emailTemplates = {
    verificationOTP,
    resetPasswordOTP,
    resetPasswordLink,
    passwordChanged,
    loginAlert,
    accountLocked
}
export default emailTemplates
