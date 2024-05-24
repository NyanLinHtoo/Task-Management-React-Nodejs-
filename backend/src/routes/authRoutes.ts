import express from 'express';
import { controller } from '../controllers/indexController';

const router = express.Router();

router.route('/verify-account').post(controller.auth.verify);
router.route('/send-verify-email').post(controller.auth.sendVerifyEmail);
router.route('/login').post(controller.auth.login);
router.route('/change-password').post(controller.auth.changePassword);
router.route('/forget-password').post(controller.auth.forgetPassword);
router.route('/reset-password/:id').post(controller.auth.resetPassword);

export default router;