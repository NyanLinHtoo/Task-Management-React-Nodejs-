import { authApiClient } from './apiClient';

class LoginService {
  verifyAccount(payload) {
    return authApiClient.post("/verify-account", payload);
  }
  login(payload) {
    return authApiClient.post('/login', payload);
  }
  sendVerificationMail(payload) {
    return authApiClient.post("/send-verify-email", payload);
  }
  changePassword(payload) {
    return authApiClient.post('/change-password', payload);
  }
  forgetPassword(payload) {
    return authApiClient.post('/forget-password', payload);
  }
  resetPassword(payload, id) {
    return authApiClient.post('/reset-password/' + id, payload);
  }
}
const loginService = new LoginService();
export default loginService;