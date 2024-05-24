import express from 'express';
import { controller } from '../controllers/indexController';
import { verifyToken, isAdmin } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/list').get(verifyToken, controller.employee.getAll);
router.route('/:id').get(verifyToken, controller.employee.getById);
router.route('/add').post(verifyToken, isAdmin, controller.employee.create);
router.route('/delete/:id').put(verifyToken, isAdmin, controller.employee.delete);
router.route('/edit/:id').put(verifyToken, controller.employee.update);

export default router;