import { Request, Response } from "express";
import pool from '../db';
import dayjs from "dayjs";


export const getReportService = async (_req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM reports ORDER BY report_id DESC');

        const formattedData = result.rows.map(row => {
            return {
                ...row,
                created_at: dayjs(row.created_at).format('YYYY-MM-DD'),
                updated_at: dayjs(row.updated_at).format('YYYY-MM-DD'),
            };
        });

        return res.json({
            success: true,
            data: formattedData,
        });
    } catch (err) {
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

export const createReportService = async (req: Request, res: Response) => {
    try {
        const payloads = req.body.map((data: any) => {
            return {
                task_id: Number(data.task_id),
                task_title: data.task_title,
                project: data.project,
                percentage: data.percentage,
                type: data.type,
                status: data.status,
                hour: data.hour,
                problem_feeling: data.problem_feeling || null,
                report_to: data.report_to,
                reported_by: data.reported_by,
                created_at: dayjs(new Date()).format('YYYY-MM-DD'),
                updated_at: dayjs(new Date()).format('YYYY-MM-DD')
            }
        });

        const query = 'INSERT INTO reports (task_id, task_title, project, percentage , type, status, hour, problem_feeling, report_to, reported_by, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *';

        const results = await Promise.all(payloads.map(async (payload: any) => {
            const values = [
                payload.task_id,
                payload.task_title,
                payload.project,
                payload.percentage,
                payload.type,
                payload.status,
                payload.hour,
                payload.problem_feeling,
                payload.report_to,
                payload.reported_by,
                dayjs(payload.created_at).format('YYYY-MM-DD'),
                dayjs(payload.updated_at).format('YYYY-MM-DD'),
            ];

            return await pool.query(query, values);
        }));

        const insertedRows = results.map(result => result.rows[0]);

        return res.json({
            success: true,
            data: insertedRows,
        });
    } catch (err) {
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}
