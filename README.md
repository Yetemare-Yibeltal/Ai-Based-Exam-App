# 🎓 HEROY — AI-Based Ethiopian University Entrance Exam Practice App

![HEROY Banner](https://via.placeholder.com/1200x400/1B3A6B/ffffff?text=HEROY+%7C+Ethiopian+Exam+Practice+Platform)

## 🇪🇹 About HEROY

HEROY is a full-stack AI-powered web application designed to help Ethiopian Grade 11 and 12 students prepare for the university entrance exam. It provides practice questions across all 6 exam subjects, AI-generated study tips, personalized feedback, and a competitive leaderboard.

---

## ✨ Features

### 👨‍🎓 For Students

- 📝 Practice quizzes with 1000+ real Ethiopian entrance exam questions
- 🤖 AI-powered instant feedback after each quiz
- 📊 Detailed performance tracking per subject
- 🏆 National leaderboard competition
- 📚 Personalized AI study tips and weak subject analysis
- 🔥 Study streak tracking
- 📅 Personalized 90-day exam preparation plan

### 👨‍🏫 For Teachers

- ✍️ Create and submit questions for review
- 🤖 AI question generation (up to 100/month)
- ✅ AI question validation and quality scoring
- 📈 Question performance analytics
- 📋 Approval workflow tracking

### 👨‍💼 For Admins

- 👥 Full user management (students & teachers)
- ✅ Question approval/rejection workflow
- 📊 Platform analytics and reports
- 📢 Broadcast announcements
- 🗂️ CSV export for reports
- ⚙️ System settings management

---

## 🛠️ Tech Stack

### Backend

- **Runtime:** Node.js + Express.js
- **Database:** MongoDB Atlas + Mongoose
- **Auth:** JWT (access + refresh tokens)
- **AI:** Claude API (claude-sonnet-4-6)
- **Email:** Nodemailer + Gmail
- **Storage:** Cloudinary
- **Security:** Helmet, CORS, Rate Limiting, Mongo Sanitize
- **Docs:** Swagger UI

### Frontend

- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS + Framer Motion
- **3D:** Three.js + React Three Fiber
- **State:** Zustand
- **HTTP:** Axios
- **Charts:** Recharts

---

## 📁 Project Structure

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- MongoDB Atlas account
- Anthropic API key
- Cloudinary account
- Gmail account (for emails)

### Backend Setup

```bash
cd heroy-exam-app/backend
npm install
cp .env.example .env
# Fill in your .env values
npm run seed:admin
npm run seed:questions
npm run seed:users
npm run dev
```

### Frontend Setup

```bash
cd heroy-exam-app/frontend
npm install
cp .env.example .env
# Fill in your .env values
npm run dev
```

### Docker Setup

```bash
# Development
docker-compose up --build

# Production
docker-compose -f docker-compose.prod.yml up --build
```

---

## 🌍 API Documentation

Once the backend is running, visit:

- **Swagger UI:** http://localhost:5000/api/docs
- **Health Check:** http://localhost:5000/health
- **API Info:** http://localhost:5000/api

---

## 📚 Subjects Covered

| Subject         | Icon | Questions |
| --------------- | ---- | --------- |
| Mathematics     | 📐   | 20+       |
| English         | 📚   | 20+       |
| Biology         | 🔬   | 20+       |
| Chemistry       | ⚗️   | 20+       |
| Physics         | ⚡   | 20+       |
| Civics & Ethics | 🏛️   | 20+       |

---

## 👥 Team

| Name     | Role               | Responsibility             |
| -------- | ------------------ | -------------------------- |
| Yibeltal | Manager + Frontend | React + Vite + Three.js    |
| Henok    | Backend            | Node.js + Express + JWT    |
| Robel    | Database           | MongoDB + Mongoose + Atlas |

---

## 🔐 Environment Variables

### Backend (.env)

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret
JWT_REFRESH_SECRET=your_refresh_secret
ANTHROPIC_API_KEY=sk-ant-...
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=HEROY
```

---

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# With coverage
npm run test:coverage
```

---

## 🚢 Deployment

- **Backend:** Railway (`railway up`)
- **Frontend:** Vercel (`vercel --prod`)
- **Database:** MongoDB Atlas
- **Files:** Cloudinary CDN

---

## 📄 License

MIT License — feel free to use and modify for educational purposes.

---

## 🙏 Acknowledgments

- Ethiopian Ministry of Education for curriculum guidelines
- Anthropic for Claude AI API
- MongoDB Atlas for database hosting
- All Ethiopian students preparing for their university entrance exams 🇪🇹

---

<div align="center">
  <strong>Built with ❤️ for Ethiopian Students 🇪🇹</strong>
  <br>
  <em>HEROY — ሄሮይ — Excellence in Education</em>
</div>
