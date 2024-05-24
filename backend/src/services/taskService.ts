import { Response, Request } from 'express';
import pool from '../db';

export async function getAll(_req: Request, res: Response) {
  try {
    const result = await pool.query(`SELECT * FROM tasks WHERE deleted_at IS NULL ORDER BY task_id DESC`);
    if (result.rows.length === 0) {
      res.status(404).send('No task found');
    } else {
      res.status(200).send(result.rows);
    }
  } catch (err) {
    res.status(500).send(err);
  }
}

export async function getOneById(req: Request, res: Response) {
  try {
    const result = await pool.query(`SELECT * FROM tasks WHERE task_id = ${req.params.id} AND deleted_at IS NULL`);
    res.send(result.rows[0]);
  } catch (err) {
    res.status(500).send(err)
  }
}

export async function create(req: Request, res: Response) {
  try {
    const { project_id, title, description, assigned_member_id, estimate_hr } = req.body;
    if (!project_id || !title || !description || !assigned_member_id || !estimate_hr) {
      return res.status(400).send('Please provide all required fields');
    }
    const query = `
      INSERT INTO tasks (
        project_id,
        title,
        description,
        assigned_member_id,
        estimate_hr,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      project_id,
      title,
      description,
      assigned_member_id,
      estimate_hr,
      new Date(),
      new Date(),
    ];

    const result = await pool.query(query, values);
    return res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    return res.status(500).send('Failed to create task: ' + err);
  }
}

export async function update(req: Request, res: Response) {
  try {
    const payload = req.body;
    const id = req.params.id;
    const task = await pool.query(`SELECT * FROM tasks WHERE task_id = '${id}'`);
    const taskDetail = task.rows[0];
    if (!payload || Object.keys(payload).length === 0) {
      return res.status(400).send('Please provide task details');
    }
    if (taskDetail.length === 0) {
      return res.status(404).send('Task not found');
    }
    const query = `UPDATE tasks SET project_id = $1, title = $2, description = $3, assigned_member_id = $4, estimate_hr = $5, actual_hr = $6, status = $7, estimate_start_date = $8, estimate_finish_date = $9, actual_start_date = $10, actual_finish_date = $11, updated_at = $12 WHERE task_id = ${id} RETURNING *`;
    const values = [
      payload.project_id,
      payload.title,
      payload.description,
      payload.assigned_member_id,
      payload.estimate_hr,
      payload.actual_hr || null,
      payload.status,
      payload.estimate_start_date || null,
      payload.estimate_finish_date || null,
      payload.actual_start_date || null,
      payload.actual_finish_date || null,
      new Date(),
    ];
    const result = await pool.query(query, values);
    return res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (err: any) {
    return res.status(500).send(err);
  }
}

export async function deleteOne(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const query = `UPDATE tasks SET deleted_at = $1 WHERE task_id = $2 RETURNING *`;
    const result = await pool.query(query, [new Date(), id]);
    if (result.rows.length === 0) {
      return res.status(404).send('Task not found');
    } else {
      return res.json({
        success: true,
        message: 'Task deleted successfully',
      });
    }
  } catch (err) {
    return res.status(500).send(err);
  }
}
