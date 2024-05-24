import { changePassword, loginService, forgetPassword, resetPassword, verifyAccountToken, sendVerificationEmail } from '../services/authService';

export const authController = {
    verify: verifyAccountToken,
    sendVerifyEmail: sendVerificationEmail,
    login: loginService,
    changePassword: changePassword,
    forgetPassword: forgetPassword,
    resetPassword: resetPassword
};