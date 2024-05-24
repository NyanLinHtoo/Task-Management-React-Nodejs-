import { createProject, deleteProject, getProject, getProjectById, updateProject } from "../controllers/projectsController";
import express from "express";

const router = express.Router();

router
    .route('/list')
    .get(getProject)

router
    .route('/:id')
    .get(getProjectById)

router
    .route('/add')
    .post(createProject)

router
    .route('/edit/:id')
    .put(updateProject)

router
    .route('/delete/:id')
    .put(deleteProject)

export default router;