import { Response, Request } from 'express';
import pool from '../db';
import bcrypt from 'bcrypt';
import { generateId } from '../utils/generateId';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import sendEmail from '../utils/sendEmail';
dotenv.config();

export async function getAll(_req: Request, res: Response) {
    try {
        const result = await pool.query(`SELECT * FROM employees WHERE deleted_at IS NULL ORDER BY employee_id DESC`);
        if (result.rows.length === 0) {
            res.status(404).send('No employees found');
        } else {
            res.status(200).send(result.rows);
        }
    } catch (err) {
        res.status(500).send(err);
    }
}

export async function getOneById(req: Request, res: Response) {
    try {
        const result = await pool.query(`SELECT * FROM employees WHERE employee_id = ${req.params.id} AND deleted_at IS NULL`);
        res.send(result.rows[0]);
    } catch (err) {
        res.status(500).send(err);
    }
}

export async function create(req: Request, res: Response) {
    try {
        const payload = req.body;
        if (Object.keys(payload).length === 0) {
            res.status(400).send('Please provide employee details');
        }
        const password = generateId(10);
        const hashedPassword = await bcrypt.hash(payload.password || password, 10);
        const query = `INSERT INTO employees (employee_name, email, password, profile, position, address, dob, phone, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`;
        const values = [
            payload.name,
            payload.email,
            hashedPassword,
            payload.profile || process.env.DEFAULT_PROFILE_IMAGE,
            payload.position,
            payload.address || null,
            payload.dob || null,
            payload.phone || null,
            new Date(),
            new Date()
        ];

        const existingUser = await pool.query(`SELECT * FROM employees WHERE email = '${payload.email}' AND deleted_at IS NULL`);
        if (existingUser.rows.length) {
            res.status(400).send('Employee with email already exist');
        }
        else {
            const result = await pool.query(query, values);
            const id = result.rows[0].employee_id;
            const loginPassword = password;
            const token = jwt.sign({ employee_id: id, email:payload.email, password: loginPassword  }, process.env.JWT_SECRET as string, { expiresIn: '1d' });
            const tokenQuery = `INSERT INTO tokens (token, employee_id) VALUES ($1, $2) RETURNING *`;
            const tokenValues = [
                token,
                result.rows[0].employee_id
            ];
            const verifyLink = `${process.env.CLIENT_URL}/verify/${id}?token=${token}&redirectTo=/login&email=${payload.email}&password=${loginPassword}`;
            const sendData = {
                verifyLink,
                email: payload.email,
                password: loginPassword
            }
            await pool.query(tokenQuery, tokenValues);
            sendEmail(payload.email, 'Welcome to our company', sendData, 'src/mail/verifyMail.html');
            res.status(201).send(result.rows[0]);
        }
    } catch (err) {
        const message = getErrorMessage(err);
        res.status(500).send(message);
    }
}

export async function update(req: Request, res: Response) {
    try {
        const payload = req.body;
        const id = req.params.id;
        const user = await pool.query(`SELECT * FROM employees WHERE employee_id = ${id} AND deleted_at IS NULL`);
        const userDetail = user.rows[0];
        if (!payload || Object.keys(payload).length === 0) {
            return res.status(400).send('Please provide employee details');
        }
        if (userDetail.length === 0) {
            return res.status(404).send('Employee not found');
        }
        if (payload.oldPassword && payload.newPassword) {
            const isPasswordCorrect: boolean = await isPasswordCorrectCheck(payload.oldPassword, userDetail.password);
            if (!isPasswordCorrect) {
                res.status(400).send('Old password is incorrect');
            }
            const samePassword = await isSamePassword(payload.newPassword, userDetail.password);
            if (samePassword) {
                res.status(400).send('New password cannot be same as old password');
            }
            const hashedPassword = await bcrypt.hash(payload.newPassword, 10);
            payload.password = hashedPassword;
        }
        const existingUser = await pool.query(`SELECT * FROM employees WHERE email = '${payload.email}' AND employee_id != ${id} AND deleted_at IS NULL`);
        if (existingUser.rows.length) {
            return res.status(400).send('Employee with email already exist');
        }
        const query = `UPDATE employees SET employee_name = $1, email = $2, password = $3, profile = $4, position = $5, address = $6, dob = $7, phone = $8, updated_at = $9 WHERE employee_id = ${id} RETURNING *`;
        const values = [
            payload.name,
            payload.email,
            payload.password || userDetail.password,
            payload.profile,
            payload.position,
            payload.address || null,
            payload.dob || null,
            payload.phone || null,
            new Date()
        ];
        const result = await pool.query(query, values);
        return res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (err: any) {
        const message = getErrorMessage(err);
        return res.status(500).send(message);
    }
}

export async function deleteOne(req: any, res: Response) {
    try {
        const loggedInUser = req.user;
        const id = req.params.id;
        if (loggedInUser.userId === parseInt(id)) {
            return res.status(400).send('You cannot delete logged in account');
        }
        const query = `UPDATE employees SET deleted_at = $1 WHERE employee_id = $2 RETURNING *`;
        const result = await pool.query(query, [new Date(), id]);
        if (result.rows.length === 0) {
            return res.status(404).send('Employee not found');
        }
        return res.json({
            success: true,
            message: 'Employee deleted successfully',
        });
    } catch (error: any) {
        return res.status(500).send(error.message);
    }
}

function isPasswordCorrectCheck(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

function isSamePassword(newPassword: string, oldPassword: string): Promise<boolean> {
    return bcrypt.compare(newPassword, oldPassword);
}

function getErrorMessage(error: any) {
    let message = error.message;
    const regex = /"(.*?)"/;
    let newMessage = message.match(regex);
    newMessage = newMessage ? newMessage[1] : '';
    if (message.includes('_') && message.includes('not-null')) {
        newMessage = `${message.split('_')[1]} is required`;
    }
    if (message.includes('not-null')) {
        newMessage = `${newMessage} is required`;
    } else {
        newMessage = error.message;
    }
    return newMessage;
}
