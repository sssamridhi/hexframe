# Hexframe — AI Creative Studio

**Live Demo:** https://hexframe.vercel.app  
**GitHub:** https://github.com/sssamridhi/hexframe

Hexframe is a full-stack AI-powered creative platform where users can generate stunning images and 3D renders from text prompts, with a chat-style interface that remembers your session history.

---

## Features

- **Text to Image** — Generate AI images from any text prompt using Pollinations.ai. Chat-style interface with session memory, reference previous images, and download generations.
- **Text to 3D** — Generate 3D-style renders with a live interactive viewer. Drag to rotate, scroll to zoom.
- **Gallery** — Personal gallery of all your generations, filterable by mode.
- **Authentication** — JWT-based signup/login with bcrypt password hashing.
- **Chat Sessions** — Multiple named chats per mode, stored in MongoDB, accessible anytime.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS |
| Backend | Next.js API Routes, Node.js |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT + bcryptjs |
| AI | Pollinations.ai (free, no API key) |
| 3D | Three.js |
| Deployment | Vercel (frontend + backend), MongoDB Atlas (database) |

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier)

### Installation

```bash
git clone https://github.com/sssamridhi/hexframe.git
cd hexframe
npm install
```

### Environment Variables

Create a `.env.local` file in the root:
- MONGODB_URI=your_mongodb_connection_string
- JWT_SECRET=your_jwt_secret
- NEXT_PUBLIC_APP_URL=http://localhost:3000

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

- `src/app/api/` — Backend API routes (auth, chats, image generation)
- `src/app/dashboard/` — Text to Image chat interface
- `src/app/generate-3d/` — Text to 3D mode with Three.js viewer
- `src/app/gallery/` — Personal image gallery
- `src/app/modes/` — Mode selection screen
- `src/models/` — Mongoose models (User, Chat)
- `src/lib/` — MongoDB connection, JWT utilities
- `src/context/` — Auth context

---

## Author

Built by [@sssamridhi](https://github.com/sssamridhi) 
