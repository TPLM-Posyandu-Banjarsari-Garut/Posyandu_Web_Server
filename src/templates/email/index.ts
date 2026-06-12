import { verificationOTP } from './verification-otp'
import { resetPasswordOTP } from './reset-password-otp'
import { passwordChanged } from './password-changed'
import { loginAlert } from './login-alert'
import { accountLocked } from './account-locked'

export const emailTemplates = {
    verificationOTP,
    resetPasswordOTP,
    passwordChanged,
    loginAlert,
    accountLocked
}
export default emailTemplates
