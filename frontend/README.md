# NexusOps 2.0 Frontend

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Animations-Framer%20Motion-E10098?style=for-the-badge&logo=framer)](https://www.framer.com/motion/)

The cinematic, high-performance frontend for the NexusOps AIOps platform.

## 🚀 Key Features

- **Cinematic Dashboard:** A high-end, responsive UI with glassmorphism and motion design.
- **Incident Monitoring:** Real-time visibility into production errors and AI remediation pipelines.
- **Memory Engine Interface:** Natural language interface for querying team knowledge.
- **AutoFix Detail:** Visual root-cause analysis, code diffs, and safety scores.
- **Unified Auth:** Seamless Google and GitHub OAuth integration via NextAuth.

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Auth:** NextAuth.js
- **State/Data:** Axios & React Hooks

## 📦 Getting Started

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Configure environment variables:**
    Create a `.env.local` file with:
    ```env
    NEXTAUTH_SECRET=your_secret
    NEXTAUTH_URL=http://localhost:3001
    NEXT_PUBLIC_API_URL=http://localhost:8000
    GOOGLE_CLIENT_ID=...
    GOOGLE_CLIENT_SECRET=...
    GITHUB_CLIENT_ID=...
    GITHUB_CLIENT_SECRET=...
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

## 🎨 Design Philosophy

NexusOps uses a **"Dark Tech"** aesthetic:
- **Primary:** Purple (#6D28D9) / Cyan (#06B6D4)
- **Background:** Deep Navy (#030712)
- **Glassmorphism:** Subtle blurs and border glows to define depth.
- **Micro-interactions:** Framer Motion transitions on all interactive elements.
