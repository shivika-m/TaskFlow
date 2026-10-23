# TaskFlow — full-stack task manager

A responsive task manager built with React + Vite, CSS, JavaScript, Express, MongoDB, and JWT authentication.

## What works
- Register, log in, and log out
- Each account sees only its own tasks
- Create, edit, complete, delete, search, and filter tasks
- Priority, due date, and category
- Dashboard counts and progress
- MongoDB persistence: tasks remain after refresh/reopening and are isolated by account
- Responsive layout with a fixed app shell and scrolling inside the content panel

## Requirements
- Node.js 20+ recommended
- MongoDB running locally, or a MongoDB Atlas connection string

## 1. Configure the backend
Open a terminal in `server`:

```bash
npm install
```

Copy `.env.example` to `.env` and set `MONGODB_URI` and a long random `JWT_SECRET`.

Start the API:

```bash
npm run dev
```

The API runs on `http://localhost:5000`.

## 2. Configure the frontend
Open a second terminal in `client`:

```bash
npm install
npm run dev
```

Open the local URL Vite prints (normally `http://localhost:5173`).

## MongoDB
Local default:
`mongodb://127.0.0.1:27017/taskflow`

For multiple users online, deploy the API and frontend and use MongoDB Atlas. Set the frontend's `VITE_API_URL` to your deployed API URL, and set the backend's `CLIENT_ORIGIN` to your deployed frontend origin.

## Deploy outline
- Database: MongoDB Atlas
- API: Render, Railway, or another Node hosting provider
- Frontend: Vercel, Netlify, or another static host
- Set environment variables on the hosting providers; never upload `.env`.

## Important production notes
This is a functional starter, not a security-audited production service. For a public launch, use HTTPS, a strong unique `JWT_SECRET`, rate limiting, email verification/password reset, monitoring, and preferably move auth tokens to secure HttpOnly cookies. Add privacy/terms pages before collecting real user data.

## Project layout
- `client/` — React + Vite frontend
- `server/` — Express API, Mongoose models, authentication middleware
