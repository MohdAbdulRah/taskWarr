# 🌟 TaskWar

**TaskWar** is a community-driven task management and gamification platform that makes productivity fun, collaborative, and intelligent.

Users can create tasks with rewards, complete tasks to earn points, compete on leaderboards, communicate in real time, and receive AI-powered task suggestions to improve productivity.

---

## 🔥 Key Features

### 📝 Task Creation
- Users can create tasks with:
  - Descriptions
  - Deadlines
  - Reward points
  - Priority levels

---

### 🏆 Task Completion & Points System
- Users earn points when they complete tasks.
- Points are calculated dynamically based on task difficulty.
- Encourages productivity and engagement.

---

### 🏅 Gamification System
- Leaderboards to show top performers.
- Badges for milestones (e.g., 10 tasks completed).
- Level progression based on accumulated points.
- Competitive yet positive productivity environment.

---

### 🤖 AI-Powered Task Suggestions
- Smart task recommendations based on user activity.
- AI suggests:
  - Task priorities
  - Estimated completion time
  - Related tasks
- Reduces decision fatigue and improves planning efficiency.

---

### 💬 Real-Time Chat Between Users
- Instant messaging using WebSockets (Socket.io).
- Discuss tasks and collaborate in real time.
- Chat history stored in database.
- No page refresh required for new messages.

---

### 🔔 Push Notifications
- Real-time alerts for:
  - Task assignments
  - Task completion
  - New messages
  - Achievement unlocks
- Keeps users engaged and informed.

---

### 👤 User Profiles
- Tracks user activity:
  - Tasks created
  - Tasks completed
  - Badges earned
  - Total points
  - Current level
- Personalized dashboard view.

---

### 🔐 Authentication & Security
- Secure login & registration using JWT.
- Password hashing with bcrypt.
- Role-based protected API routes.
- CORS and security middleware implemented.

---

## 🛠 Tech Stack

### Frontend
- React (or Next.js)
- TailwindCSS / Shadcn UI
- Axios for API requests
- WebSocket client integration

### Backend
- Node.js + Express.js
- REST API architecture
- Socket.io for real-time communication

### Database
- MongoDB (Atlas)

### AI Integration
- AI service integration for:
  - Smart task recommendations
  - Priority prediction
  - Productivity optimization

### Security
- JWT Authentication
- bcrypt password hashing
- Input validation & middleware

---

## 🧱 Project Structure

```
/project-root
│── /backend        # Express server + API + database models
│── /frontend       # React/Next.js UI
│── .gitignore
└── README.md
```

---

## ⚡ Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/taskWarr.git
cd taskWarr
```

---

### 2️⃣ Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Start server:

```bash
npm start
```

---

### 3️⃣ Setup Frontend

```bash
cd ../frontend
npm install
```

Create `.env` file:

```
REACT_APP_API_URL=http://localhost:5000
```

Start frontend:

```bash
npm start
```

---

## 🚀 Deployment

- Frontend: Vercel / Netlify
- Backend: Render / Railway
- Database: MongoDB Atlas

---
## LIVE URL :-  https://task-war-ep11.onrender.com

---
## 🎯 What Makes TaskWar Unique?

- Combines **task management + gamification + AI**
- Real-time collaboration built-in
- Intelligent productivity assistant
- Scalable full-stack architecture

---

## 🎓 Learning Outcomes

Through TaskWar, I gained experience in:

- Full-stack application architecture (MERN)
- Real-time communication systems (WebSockets)
- Designing gamification algorithms
- Integrating AI services into production systems
- Secure authentication & authorization
- Database schema optimization
- Scalable backend design

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository  
2. Create a new branch  
3. Make your changes  
4. Submit a Pull Request  

---

## 📄 License

This project is licensed under the MIT License.

---

⭐ If you find this project helpful, please give it a star!
