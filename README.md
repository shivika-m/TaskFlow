# TaskFlow

A task management web application built with React, Vite, Node.js, and Express.

**Live Demo:** [Try TaskFlow](https://task-flow-jade-eta-96.vercel.app/)

## Tech Stack

**Frontend**
- React
- JavaScript
- Vite
- CSS

**Backend**
- Node.js
- Express.js

**Database**
- MongoDB
- Mongoose

**Authentication & Security Libraries**
- JSON Web Token (JWT)
- bcryptjs
- Google Auth Library
- Express Rate Limit

## Project Structure

```text
taskflow/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── src/
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── models/
│   │   │   ├── Task.js
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   └── tasks.js
│   │   └── index.js
│   └── package.json
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- Node.js and npm
- A MongoDB instance, if using the backend's database features

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd taskflow
```

### 2. Start the backend

```bash
cd server
npm install
```

Configure the required environment variables using `server/.env.example`.

Start the development server:

```bash
npm run dev
```

### 3. Start the frontend

Open a second terminal in the project root:

```bash
cd client
npm install
npm run dev
```

Open the local URL provided by Vite.

Ensure the frontend's API configuration matches the backend URL if the application uses the backend.

## Environment Variables

Use the relevant `.env.example` files to configure environment variables. Do not commit actual `.env` files containing secrets or credentials.

## Author

**Shivika Mehlawat**

[GitHub Profile](https://github.com/shivika-m)
