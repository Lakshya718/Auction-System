# Auction-Sytem
# 🧾 Auction System 🎯

An online auction web application for sports auction where admin can create, lists, and control bids on products in real-time. This project is built with **React + Vite** on the frontend and **Node.js** (with Kafka & Redis) on the backend.

---

### For demo u can use
- email : test1@gmail.com
- password : 12345678
## 🔗 Live Project

- 🌐 **Frontend (React)**: [https://auction-system.vercel.app](https://auction-system-lakshya.vercel.app)
- 🛠️ **Backend (API)**: [https://auction-server.onrender.com](https://auction-sytem.onrender.com)

> Replace the above URLs with your actual deployed frontend and backend links.

---

## 📸 Screenshots


| Home<img width="1919" height="951" alt="Screenshot 2025-06-21 203133" src="https://github.com/user-attachments/assets/e43fa2d7-4e05-4b1a-9bbc-2220271a13d2" />
| Create Auction<img width="1861" height="950" alt="Screenshot 2025-06-21 190245" src="https://github.com/user-attachments/assets/88b9dcef-0e72-4f3e-a307-d0d6b7153479" />
| Edit Profile<img width="1917" height="889" alt="image" src="https://github.com/user-attachments/assets/1e32865f-a937-4df1-9302-580c05810206" />
| Live Auction Page<img width="1882" height="876" alt="Screenshot 2025-06-14 102419" src="https://github.com/user-attachments/assets/4ea1040a-ef1a-4b39-82e0-a5e97b745623" />

| ![Add Player]<img width="1031" height="936" alt="image" src="https://github.com/user-attachments/assets/372230ae-9372-4d58-89a6-7d1ab9d4d37a" />
 | ![Admin Dashboard]<img width="913" height="887" alt="image" src="https://github.com/user-attachments/assets/2cd0630a-c52e-4bc4-851f-bfb005307ce5" />


---

## 🚀 Features

- 🧑 Players authentication 
- 📦 Teams dashboard to view auction players
- ⏱  Real-time bidding system
- 📈 Bid history and analytics
- 💬 Kafka-based real-time trasaction
- 🛡 Secure and responsive interface
- R  Atomic Redis States

---

## 🛠 Tech Stack

### Frontend:
- React (Vite)
- React Icons
- Tailwind CSS
- Socket.io

### Backend:
- Node.js
- Express
- Kafka
- MongoDB
- Redis

### DevOps:
- Vercel (Frontend hosting)
- Render (Backend hosting)
- Git & GitHub

---

## 📁 Folder Structure
Auction-System/
├── client/ # React frontend
│ └── src/pages/
├── server/ # Node backend with Kafka
│ └── src/kafka/
├── README.md

---

## 🧑‍💻 Getting Started

### Clone the repo

```bash
git clone https://github.com/Lakshya718/Auction-Sytem.git
cd Auction-Sytem
```

Setup Frontend:
cd client
npm install
npm run dev

Setup backend:
cd ../server
npm install
npm run dev

### How It Works:
- Players register them for upcoming auction.
- Team Owners can view and bid in real-time at auction date & time.
- Kafka handles bid updates and socket.io broadcasts them.
- When the auction ends, all players are assigned to their teams.
