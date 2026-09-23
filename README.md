# Hexframe — AI Creative Studio

[![CI](https://github.com/sssamridhi/hexframe/actions/workflows/ci.yml/badge.svg)](https://github.com/sssamridhi/hexframe/actions/workflows/ci.yml)

**Live Demo:** https://hexframe.vercel.app

Hexframe is a full-stack AI creative platform for text-to-image generation, persistent chat history, personal galleries, and interactive visualization of AI-generated 3D-style renders.

## Features

- **Text to Image** — Generate images from prompts using Pollinations.ai.
- **3D-Style Render Viewer** — Generate 3D-styled imagery and explore it on an interactive Three.js object with drag-to-rotate and scroll-to-zoom controls.
- **Gallery** — Save and revisit generations.
- **Authentication** — JWT signup/login with bcrypt password hashing.
- **Persistent Chats** — Store sessions in MongoDB.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React, TypeScript, Tailwind CSS |
| Backend | Next.js API Routes, Node.js |
| Database | MongoDB Atlas + Mongoose |
| Authentication | JWT + bcryptjs |
| AI | Pollinations.ai |
| 3D Visualization | Three.js |
| Testing | Vitest |
| CI | GitHub Actions |
| Deployment | Vercel + MongoDB Atlas |

## Getting Started

```bash
git clone https://github.com/sssamridhi/hexframe.git
cd hexframe
npm install
cp .env.example .env.local
npm run dev
```

Environment variables:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Testing

```bash
npm test
npm run test:watch
```

The first unit test suite covers JWT signing/verification and Bearer-token parsing.

## Continuous Integration

GitHub Actions runs linting, unit tests, and a production build on pushes and pull requests to `main`.

## Project Structure

- `src/app/api/` — auth, chats, gallery, and generation routes
- `src/app/dashboard/` — image generation interface
- `src/app/generate-3d/` — 3D-style render viewer
- `src/models/` — Mongoose models
- `src/lib/` — MongoDB and JWT utilities
- `tests/` — unit tests
- `.github/workflows/` — CI

## Current Limitation

The 3D mode visualizes AI-generated 3D-style imagery on an interactive Three.js mesh. It does **not** generate a true 3D mesh or model from text.

## Author

Built by [@sssamridhi](https://github.com/sssamridhi)
