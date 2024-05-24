import express from "express";
import { getReport, createReport } from "../controllers/reportController";

const router = express.Router();

router
    .route("/list")
    .get(getReport)

router
    .route("/add")
    .post(createReport)

export default router;