# MERN Multi App (ToDo + Notes + Quiz)

Single MERN project with 3 modules in one app:

- ToDo App
- Notes App
- Quiz App

## Features

- Full CRUD for todos, notes, and quizzes
- Quiz builder with multiple questions per quiz
- Quiz runner with score tracking and restart flow
- Filterable todo list with edit and clear-completed actions
- Inline note editing with persistent storage in MongoDB

## Project Structure

- `server` → Express + MongoDB API
- `client` → React (Vite) frontend

## Setup

1. Create env file for backend:

   - Copy `server/.env.example` to `server/.env`
   - Update `MONGO_URI` if needed

2. Optional env file for frontend:

   - Add `client/.env` with `VITE_API_BASE_URL=http://localhost:5000/api` if your API runs on a different host

3. Install dependencies:

```bash
npm install
npm install --prefix server
npm install --prefix client
```

4. Start both frontend and backend:

```bash
npm run dev
```

## URLs

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Health API: `http://localhost:5000/api/health`

## API Endpoints

### Todos

- `GET /api/todos`
- `POST /api/todos`
- `PUT /api/todos/:id`
- `DELETE /api/todos/:id`

### Notes

- `GET /api/notes`
- `POST /api/notes`
- `PUT /api/notes/:id`
- `DELETE /api/notes/:id`

### Quizzes

- `GET /api/quizzes`
- `POST /api/quizzes`
- `PUT /api/quizzes/:id`
- `DELETE /api/quizzes/:id`
