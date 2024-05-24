import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET;

export function verifyToken(req: any, res: any, next: any) {
    try {
        const token = req.headers['x-authentication-token'];
        if (!token) {
            return res.status(401).send('Unauthorized. Please login first.');
        }
        const decodedUser = jwt.verify(token, SECRET_KEY as string);
        req.user = decodedUser;
        req.token = token;
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).send('Token expired. Please login again.');
        }
        return res.status(401).send('Invalid token. Please login again.');
    }
}

export function isAdmin(req: any, res: any, next: any) {
    if (parseInt(req.user.type) !== 0) {
        return res.status(403).send("Forbidden , This page is only accessible for Admin User");
    }
    next();
}
