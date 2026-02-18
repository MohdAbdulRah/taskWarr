🚀 TaskWar

TaskWar is a community-driven task management and gamification platform.
Users can create tasks, assign rewards, and others can complete those tasks to earn points.
It makes productivity fun, competitive, and rewarding with leaderboards, badges, and achievements.

✨ Features

📝 Task Creation – Create tasks with descriptions, deadlines, and reward points.

🎯 Task Completion – Complete tasks and earn points.

🏆 Gamification – Leaderboards, achievements, and levels for active users.

👥 Profiles – Track created & completed tasks, badges, and points.

🔔 Notifications – Stay updated on assigned and completed tasks.

🔒 Secure – Authentication and role-based access.

🛠️ Tech Stack
Frontend

React (or Next.js)

TailwindCSS / Shadcn UI

Axios (API calls)

Backend

Node.js + Express

MongoDB (Atlas)

JWT Authentication

CORS & Security Middleware

Deployment

Frontend: Render (Static Site)

Backend: Render (Web Service)

Database: MongoDB Atlas

📂 Project Structure
/project-root
│── /backend          # Express server + MongoDB
│    ├── node_modules
│    ├── .env
│    ├── server.js
│    └── ...
│
│── /frontend         # React/Next.js frontend
│    ├── node_modules
│    ├── .env
│    ├── src/
│    └── ...
│
│── .gitignore
│── README.md
└── ...

⚡ Getting Started
1️⃣ Clone the repo
git clone https://github.com/your-username/taskwar.git
cd taskwar

2️⃣ Backend Setup
cd backend
npm install


Create .env file inside backend/

PORT=5000
MONGO_URI=your_mongo_url
JWT_SECRET=your_secret_key


Run the backend:

npm start

3️⃣ Frontend Setup
cd ../frontend
npm install


Create .env file inside frontend/

REACT_APP_API_URL=http://localhost:5000


Run the frontend:

npm start

🌐 Deployment

Frontend: Deploy as a Static Site on Render

Backend: Deploy as a Web Service on Render

Update frontend .env.production with:

REACT_APP_API_URL=https://your-backend.onrender.com

LIVE URL :-  https://task-war-ep11.onrender.com

🎯 Future Enhancements

✅ Points → Rewards Store

✅ Task categories & filters

✅ AI-powered task recommendations

✅ Real-time chat for collaboration

🤝 Contributing

Contributions are welcome! 🎉

Fork the repo

Create a new branch

Commit your changes

Submit a pull request

📜 License

This project is licensed under the MIT License.
