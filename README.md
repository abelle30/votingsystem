# Student Voting System

A Vercel-ready voting portal built with Next.js and MySQL. It includes voter registration and sign-in, an authenticated ballot with one choice per position, an administrator dashboard for candidates and eligible student IDs, and results reporting.

> **Election safety:** This is a starter application, not a certified election platform. Have election and security professionals review it before using it for a real election. The app stores a receipt row for each selected position; administrators can see candidate totals. Restrict result access and database access according to your election rules.

## Deploy to Vercel

### 1. Create a hosted MySQL database

Vercel does not provide a MySQL server. Provision MySQL 8 with a database host that accepts secure connections from your Vercel region. Do not use `localhost`, XAMPP, or a database reachable only from your laptop.

### 2. Create the tables

Import [database/vercel-schema.sql](database/vercel-schema.sql) into a **new, empty** MySQL database. This schema is for the Next.js app and is separate from the legacy PHP dump `database/vote.sql`. It has no voter data, administrator account, or sample ballot. Do not import both schema files into one database. The election starts closed; the schema creates the corresponding setting row.

### 3. Import the application into Vercel

Push this repository to GitHub, import the repository in Vercel, and keep the framework preset as **Next.js**. The included `vercel.json` selects the Next.js framework.

### 4. Configure Vercel environment variables

Add these variables for **Production** and **Preview** as needed:

| Variable | Value |
| --- | --- |
| `DB_HOST` | Managed MySQL hostname |
| `DB_PORT` | MySQL port, usually `3306` |
| `DB_USER` | Database user with access to this database |
| `DB_PASSWORD` | Database password |
| `DB_NAME` | Database name |
| `DB_SSL` | `true` when required by your provider (recommended) |
| `SESSION_SECRET` | Random, private string of at least 32 characters |
| `ADMIN_SETUP_TOKEN` | Random, one-time setup token of at least 24 characters |

Use different strong values for preview and production. Never commit actual secrets. Generate tokens with a secure password manager or a cryptographically secure random generator. Redeploy after setting or changing variables.

### 5. Initialize the first administrator

After the deployment is ready, open `/setup` on that deployment. Enter the `ADMIN_SETUP_TOKEN`, choose an administrator username, and use a strong password of at least 12 characters. This endpoint creates an account only while `admin_users` is empty. Keep the setup token secret; remove `ADMIN_SETUP_TOKEN` from Vercel and redeploy after creating the first admin.

### 6. Add election data
- Sign in at `/admin`. First add eligible student IDs and each official name, then add at least one candidate to every ballot position. Students can register only when their ID and full name match the eligibility list. Review the ballot, then explicitly open voting in the admin dashboard. Results remain hidden from voters and administrators while voting is open. Closing voting reveals results. Candidate changes are locked after opening or the first submitted vote.

## Local development

1. Install Node.js 20 or newer and MySQL 8.
2. Import `database/vercel-schema.sql` into a new local database.
3. Copy `.env.example` to `.env.local` and fill in the MySQL connection, `SESSION_SECRET`, and `ADMIN_SETUP_TOKEN` values. Keep `.env.local` private.
4. Run `npm install`, then `npm run dev` and visit `http://localhost:3000`.
5. Initialize an administrator at `http://localhost:3000/setup`.

Check the database connection at `/api/health`; the endpoint reports health only and does not reveal connection details.

## Implemented routes
- `/` — public landing page
- `/register` — eligible voter registration
- `/login` and `/ballot` — voter sign-in and ballot
- `/admin`, `/setup`, `/admin/dashboard` — administrator sign-in, one-time bootstrap, and dashboard
- `/api/health` — database health check

Admin APIs are authenticated and use parameterized SQL queries. Ballot writes run in a database transaction; a unique database key prevents a voter from recording more than one choice for a position. Passwords for the new app are scrypt-hashed. `npm run lint`, `npm run build`, and `npm audit --omit=dev` are the local checks. The production website has been smoke-tested locally; complete voter/database integration requires a configured MySQL server. Do not rely on this starter as a substitute for an independent election-integrity assessment.

## Legacy PHP project

The original PHP application remains in the repository for local/XAMPP reference. Vercel's standard Node.js runtime does not execute PHP files, so the Vercel website is the new Next.js app in `src/`. The old `database/vote.sql` is a schema-only legacy dump and is not the schema for the Next.js application.