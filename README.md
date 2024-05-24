# Task Management System

This is a sample project of Full Stack Web App project for Task Management System developed by using [ReactJs](https://react.dev/) and [Node.js](https://nodejs.org/en/docs).

Framework: [ReactJs](https://react.dev/) and [Node.js](https://nodejs.org/en/docs),
Database : [PostgreSQL](https://www.postgresql.org/),
Image Storage: [Cloudinary](https://cloudinary.com/),
Duration: 2023-05-08 to 2023-05-31.

## Setup

Copy **.env.example** file and replace with **your own environment setting**.


Install dependencies

```

npm install

```
and create database.
```

createdb -U postgres task_mng_sys

```

Open PostgreSQL server and migrate database.**(Only After fill PostgreSQL env setting in .env file)**

```

npm run migrate:up

```

Run seeder for initial data

```

npm run seed:run

```

Run the development server:

```bash

npm run dev

# or

yarn dev

```

Open [http://localhost:5173](http://localhost:5173) with your browser to see the result.