import { Request, Response } from "express";
import pool from '../db';
import dayjs from "dayjs";

export const getProjectServices = async (_req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM projects WHERE deleted_at IS NULL ORDER BY project_id DESC');
        return res.json({
            success: true,
            data: result.rows,
        });
    } catch (err) {
        return res.send(err);
    }
};

export const getProjectByIdServices = async (req: Request, res: Response) => {
    const project_id = parseInt(req.params.id)
    try {
        const result = await pool.query('SELECT * FROM projects WHERE project_id = $1 AND deleted_at IS NULL', [project_id]);
        return res.json({
            success: true,
            data: result.rows[0],
        });
    } catch (err) {
        return res.send(err);
    }
}

export const createProjectServices = async (req: Request, res: Response) => {
    try {
        const payload = req.body;
        const query = 'INSERT INTO projects (project_name,language,description,start_date , end_date, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *'
        const values = [
            payload.project_name,
            payload.language,
            payload.description || null,
            payload.start_date ? dayjs(payload.start_date).format('YYYY-MM-DD') : null,
            payload.end_date ? dayjs(payload.end_date).format('YYYY-MM-DD') : null,
            new Date(),
            new Date(),
        ];

        const result = await pool.query(query, values);
        return res.json({
            success: true,
            data: result.rows[0],
        });
    } catch (err: any) {
        return res.status(500).send(err.message);
    }
};

export const updateProjectServices = async (req: Request, res: Response) => {
    const project_id = parseInt(req.params.id);
    const payload = req.body;
    try {
        const query = 'UPDATE projects SET project_name = $1, language = $2, description = $3, start_date = $4, end_date = $5, updated_at = $6 WHERE project_id = $7 RETURNING *'
        const values = [
            payload.project_name,
            payload.language,
            payload.description || null,
            payload.start_date ? dayjs(payload.start_date).format('YYYY-MM-DD') : null,
            payload.end_date ? dayjs(payload.end_date).format('YYYY-MM-DD') : null,
            new Date(),
            project_id
        ];
        const result = await pool.query(query, values);
        return res
            .status(201)
            .json({
                success: true,
                data: result.rows[0],
            });
    } catch (err: any) {
        return res.status(500).send(err.message);
    }
}

export const deleteProjectServices = async (req: Request, res: Response) => {
    const project_id = parseInt(req.params.id);
    try {
        let checkQuery = `SELECT * FROM tasks WHERE project_id = $1`;
        let checkResult = await pool.query(checkQuery, [project_id]);
        if (checkResult.rows.length > 0) {
            const title = checkResult.rows.map((item: any) => item.title).toString();
            return res.status(400).send(`Cannot delete project. It is still being referenced in task name: ${title}.`);
        }
        const query = 'UPDATE projects SET deleted_at = $1 WHERE project_id = $2 RETURNING *'
        const values = [
            new Date(),
            project_id
        ];
        const result = await pool.query(query, values);
        return res
            .status(201)
            .json({
                success: true,
                data: result.rows[0],
            });
    } catch (err: any) {
        return res.status(500).send(err.message);
    }
}
