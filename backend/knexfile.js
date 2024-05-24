require('ts-node/register');
require('@babel/register');
require('dotenv').config();

module.exports = {
    development: {
        client: 'pg',
        connection: {
            host: process.env.POSTGRES_HOST,
            user: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            database: process.env.POSTGRES_DATABASE,
            port: process.env.DB_PORT,
            ssl: { rejectUnauthorized: false }
        },
        migrations: {
            directory: './migrations',
        },
        seeds: {
            directory: './src/seeds',
        },
    },
};
