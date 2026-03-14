MERN Multi App (ToDo • Notes • Quiz)

A full-stack MERN application that combines three productivity tools into a single platform:

✔ ToDo Manager
✔ Notes Manager
✔ Quiz Builder & Runner

This project demonstrates CRUD operations, REST APIs, state management, and MongoDB integration in a modern MERN stack application.

✨ Features
📝 ToDo Manager

Create, update, and delete tasks

Mark tasks as completed

Filter tasks (active / completed)

Clear completed tasks

📒 Notes Manager

Create and edit notes inline

Persistent storage using MongoDB

Quick updates and deletions

🧠 Quiz Builder & Runner

Create quizzes with multiple questions

Run quizzes interactively

Score tracking

Restart quiz functionality

🛠 Tech Stack
Frontend

React

Vite

Axios

CSS / UI Components

Backend

Node.js

Express.js

MongoDB

REST API Architecture

📂 Project Structure
mern-multi-app/
│
├── server/        # Express + MongoDB backend
│
├── client/        # React (Vite) frontend
│
└── README.md
⚙️ Installation & Setup
1️⃣ Clone the Repository
git clone https://github.com/yourusername/mern-multi-app.git
cd mern-multi-app
2️⃣ Environment Setup
Backend Environment

Copy the example file:

cp server/.env.example server/.env

Edit .env if necessary:

MONGO_URI=mongodb://localhost:27017/mern-multi-app
PORT=5000
Frontend Environment (Optional)

Create client/.env

VITE_API_BASE_URL=http://localhost:5000/api
📦 Install Dependencies
npm install
npm install --prefix server
npm install --prefix client
▶️ Run the Application

Start both frontend and backend simultaneously:

npm run dev
🌐 Application URLs

Frontend

http://localhost:5173

Backend

http://localhost:5000

Health API

http://localhost:5000/api/health
🔗 API Endpoints
Todos API
Method	Endpoint
GET	/api/todos
POST	/api/todos
PUT	/api/todos/:id
DELETE	/api/todos/:id
Notes API
Method	Endpoint
GET	/api/notes
POST	/api/notes
PUT	/api/notes/:id
DELETE	/api/notes/:id
Quiz API
Method	Endpoint
GET	/api/quizzes
POST	/api/quizzes
PUT	/api/quizzes/:id
DELETE	/api/quizzes/:id
📌 Key Concepts Demonstrated

MERN stack full-stack architecture

RESTful API design

CRUD operations

MongoDB database integration

Component-based frontend design

👩‍💻 Author

Shivangi Singh

GitHub
https://github.com/ShivangiSingh13

LinkedIn
https://www.linkedin.com/in/shivangi131/

⭐ Contributing

Contributions, issues, and suggestions are welcome.

📄 License

This project is created for learning and portfolio demonstration purposes.

✅ This version will look much cleaner on GitHub because it includes:

proper headings

feature sections

tables for APIs

structured layout
# task-manager
