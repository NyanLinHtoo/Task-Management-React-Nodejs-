import express from 'express';
import { Client } from 'pg';
import employeeRoute from './routes/employeeRoutes';
import authRoute from './routes/authRoutes';
import taskRoute from './routes/taskRoutes';
import cors from 'cors';
import { createServer } from 'http';
import { configureSocket } from './socketIo';
import projectRoutes from './routes/projectRoute';
import reportRoutes from './routes/reportRoutes';

const PORT = process.env.PORT;
const connectionString = process.env.DATABASE_URL;
const app = express();

const client = new Client({
    connectionString: connectionString
})

const server = createServer(app);
configureSocket(server);

client.connect();

app.use(cors({
    origin: '*'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/auth', authRoute);
app.use('/api/employee', employeeRoute);
app.use('/api/project', projectRoutes);
app.use('/api/task', taskRoute);
app.use('/api/report', reportRoutes);

server.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
})