import { Request, Response } from "express";
import { createReportService, getReportService } from "../services/reportService";

export const getReport = async (_req: Request, res: Response) => {
    getReportService(_req, res)
}

export const createReport = async (_req: Request, res: Response) => {
    createReportService(_req, res)
}
