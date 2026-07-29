# 🧩 MERN Multi App (ToDo • Notes • Quiz)

A full-stack MERN application that combines three productivity tools into a single platform:

- ✔ **ToDo Manager**
- ✔ **Notes Manager**
- ✔ **Quiz Builder & Runner**

This project demonstrates CRUD operations, REST APIs, state management, and MongoDB integration in a modern MERN stack application.

![Tech Stack](https://img.shields.io/badge/Stack-MERN-green)
![License](https://img.shields.io/badge/License-Learning%2FPortfolio-blue)

---

## 📖 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation & Setup](#️-installation--setup)
- [Install Dependencies](#-install-dependencies)
- [Run the Application](#️-run-the-application)
- [Application URLs](#-application-urls)
- [API Endpoints](#-api-endpoints)
- [Key Concepts Demonstrated](#-key-concepts-demonstrated)
- [Author](#-author)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 📝 ToDo Manager
- Create, update, and delete tasks
- Mark tasks as completed
- Filter tasks (active / completed)
- Clear completed tasks

### 📒 Notes Manager
- Create and edit notes inline
- Persistent storage using MongoDB
- Quick updates and deletions

### 🧠 Quiz Builder & Runner
- Create quizzes with multiple questions
- Run quizzes interactively
- Score tracking
- Restart quiz functionality

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React | UI framework |
| Vite | Development & build tool |
| Axios | API requests |
| CSS / UI Components | Styling |

### Backend
| Technology | Purpose |
|---|---|
| Node.js | Runtime environment |
| Express.js | REST API server |
| MongoDB | Database |
| REST API Architecture | API design pattern |

---

## 📂 Project Structure

```
mern-multi-app/
│
├── server/        # Express + MongoDB backend
│
├── client/        # React (Vite) frontend
│
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/mern-multi-app.git
cd mern-multi-app
```

### 2️⃣ Environment Setup

**Backend Environment**

Copy the example file:

```bash
cp server/.env.example server/.env
```

Edit `.env` if necessary:

```env
MONGO_URI=mongodb://localhost:27017/mern-multi-app
PORT=5000
```

**Frontend Environment (Optional)**

Create `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 📦 Install Dependencies

```bash
npm install
npm install --prefix server
npm install --prefix client
```

---

## ▶️ Run the Application

Start both frontend and backend simultaneously:

```bash
npm run dev
```

---

## 🌐 Application URLs

| Service | URL |
|---|---|
| Frontend | `http://localhost:5173` |
| Backend | `http://localhost:5000` |
| Health API | `http://localhost:5000/api/health` |

---

## 🔗 API Endpoints

### Todos API

| Method | Endpoint |
|---|---|
| GET | `/api/todos` |
| POST | `/api/todos` |
| PUT | `/api/todos/:id` |
| DELETE | `/api/todos/:id` |

### Notes API

| Method | Endpoint |
|---|---|
| GET | `/api/notes` |
| POST | `/api/notes` |
| PUT | `/api/notes/:id` |
| DELETE | `/api/notes/:id` |

### Quiz API

| Method | Endpoint |
|---|---|
| GET | `/api/quizzes` |
| POST | `/api/quizzes` |
| PUT | `/api/quizzes/:id` |
| DELETE | `/api/quizzes/:id` |

---

## 📌 Key Concepts Demonstrated

- MERN stack full-stack architecture
- RESTful API design
- CRUD operations
- MongoDB database integration
- Component-based frontend design

---

## 👩‍💻 Author

**Shivangi Singh**

- GitHub: [ShivangiSingh13](https://github.com/ShivangiSingh13)
- LinkedIn: [shivangi131](https://www.linkedin.com/in/shivangi131/)

---

## ⭐ Contributing

Contributions, issues, and suggestions are welcome.

---

## 📄 License

This project is created for learning and portfolio demonstration purposes.
