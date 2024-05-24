import express from "express";
import { controller } from "../controllers/indexController";

const router = express.Router();

router.route('/list').get(controller.task.getAll);
router.route('/:id').get(controller.task.getById);
router.route('/add').post(controller.task.create);
router.route('/edit/:id').put(controller.task.update);
router.route('/delete/:id').put(controller.task.delete);

export default router;