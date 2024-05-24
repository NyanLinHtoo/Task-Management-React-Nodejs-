import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import pool from '../db';
import dotenv from 'dotenv';
import sendEmail from '../utils/sendEmail';
dotenv.config();
const SECRET_KEY = process.env.JWT_SECRET;

export const verifyAccountToken = async (req: Request, res: Response) => {
  try {
    const token = req.body.token;
    if (!token) {
      return res.status(401).json('Unauthorized.');
    }
    const decoded: any = jwt.verify(token as string, SECRET_KEY as string);
    const result = await pool.query(`SELECT * from tokens WHERE employee_id = ${decoded.employee_id}`);
    if (!result.rows.length) {
      return res.status(200).json('Your account is already verified.');
    }
    if (result.rows.length > 0) {
      await pool.query(`UPDATE employees SET verified = true WHERE employee_id = ${decoded.employee_id} RETURNING *`);
      await pool.query(`DELETE FROM tokens WHERE employee_id = ${decoded.employee_id}`);
    }
    return res.status(200).json('Account verified.');
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Token expired' });
    } else {
      return res.status(500).json({ error: 'Token verification failed' });
    }
  }
}

export const sendVerificationEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await pool.query('SELECT * FROM employees WHERE email = $1 AND deleted_at IS NULL', [email]);
    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found. Please create account first.' });
    }
    if (user.rows[0].verified) {
      return res.status(200).json({ message: 'Your account is already verified.' });
    }
    let token;
    const result = await pool.query(`SELECT * FROM tokens WHERE employee_id = ${user.rows[0].employee_id}`);
    if (result.rows.length > 0) {
      token = result.rows[0].token;
    } else {
      token = jwt.sign({ employee_id: user.rows[0].employee_id, password: '-' }, SECRET_KEY as string);
      await pool.query(`INSERT INTO tokens (employee_id, token) VALUES (${user.rows[0].employee_id}, '${token}')`);
    }
    const decodedToken: any = jwt.verify(token as string, SECRET_KEY as string);
    const verifyLink = `${process.env.CLIENT_URL}/verify/${decodedToken.employee_id}?token=${token}&redirectTo=/login&email=${email}&password=${decodedToken.password}`;
    await sendEmail(email, 'Verify your account', { verifyLink: verifyLink, email, password: decodedToken.password }, 'src/mail/verifyMail.html');
    return res.status(200).json({ message: 'Verification email sent.' });
  } catch (err) {
    return res.status(500).json({ error: err, message: 'Failed to send verification email.' });
  }
}

export const loginService = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await pool.query('SELECT * FROM employees WHERE email = $1 AND deleted_at IS NULL', [email]);
    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    if (!user.rows[0].verified) {
      return res.status(401).json({ error: 'Please verify your account.' });
    }
    const match = await bcrypt.compare(password, user.rows[0].password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    const token = jwt.sign({ userId: user.rows[0].employee_id, type: user.rows[0].position }, SECRET_KEY as string, { expiresIn: '1D' });
    return res.status(200).json({ token });
  } catch (err) {
    return res.status(500).json({ error: err, message: 'Failed to log in.' });
  }
}

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { email, oldPassword, newPassword, confirmPassword } = req.body;
    const user = await pool.query('SELECT * FROM employees WHERE email = $1 AND deleted_at IS NULL', [email]);
    if (oldPassword === newPassword && confirmPassword) {
      return res.status(400).json({ error: 'Old Password and New Password must not be the same.' })
    }

    if (!user) {
      return res.status(404).json({ error: ' This user does not exist.' });
    }

    const passwordMatch = await bcrypt.compare(oldPassword, user.rows[0].password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'The password does not match with your old password.' });
    }

    if (newPassword === confirmPassword) {
      const saltRounds = 10;
      return bcrypt.hash(newPassword && confirmPassword, saltRounds, async (err, hashedPassword) => {
        if (err) {
          return res.status(500).json({ error: 'An error occurred while hashing the new password.' });
        }
        user.rows[0].password = hashedPassword;
        try {
          await pool.query('UPDATE employees SET password = $1 WHERE email = $2', [hashedPassword, email]);
          return res.sendStatus(200).json({ message: 'Password changed' });
        } catch (err) {
          return res.status(500).json({ error: 'An error occurred while updating the password.' });
        }
      });
    } else {
      return res.status(400).json({ error: 'new password and confirm password are not the same.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'An error occurred while changing the password.' });
  }
}

export const forgetPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await pool.query('SELECT * FROM employees WHERE email = $1 AND deleted_at IS NULL', [email]);
    const resetToken = jwt.sign({ userId: user.rows[0].employee_id }, SECRET_KEY as string, { expiresIn: '1D' });
    const resetLink = `http://127.0.0.1:5173/reset-password?token=${resetToken}`;

    if (!user || user.rows.length === 0) {
      return res.status(404).json({ error: ' This user does not exist.' });
    }
    return sendEmail(user.rows[0].email, 'Password Reset', { resetLink }, 'src/mail/resetPasswordMail.html').then(() => {
      return res.status(200).json({ message: 'reset password email sent successfully' })
    }).catch(() => {
      return res.status(500).json({ error: 'An error occurred while sending the password reset email.' });
    });
  } catch (err) {
    return res.status(500).json({ error: 'An error occurred while changing the password.' });
  }
}

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New password and confirm password are not the same.' });
    }
    const id = req.params.id;
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    const user = await pool.query('SELECT * FROM employees WHERE employee_id = $1 AND deleted_at IS NULL', [id]);
    if (!user || user.rows.length === 0) {
      return res.status(404).json({ error: ' This user does not exist.' });
    }
    try {
      await pool.query('UPDATE employees SET password = $1 WHERE employee_id = $2 ', [hashedPassword, id]);
      return res.status(200).json({ message: 'Password changed.' });
    } catch (err) {
      return res.status(500).json({ error: 'An error occurred while updating the password.' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'An error occurred while resetting the password.' });
  }
}
