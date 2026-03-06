<p align="center">
  <img src="public/resources/codivirlogo.png" width="220" alt="CODIVIR Logo">
</p>

<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Cambria&size=28&duration=5000&color=00FFFF&center=true&vCenter=true&width=1000&height=70&lines=CODIVIR+-+Collaborative+Code+Sharing+Platform;Real-time+Multi-Language+Compiler;Powered+by+Next.js+15+%26+Liveblocks" alt="Typing SVG" />
</p>

<h2 align="center">💻 Code. Collaborate. Share. Instantly.</h2>

---

<p align="center">
  <img src="https://img.shields.io/badge/Next.js%2015-Frontend-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-Logic-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Liveblocks-Collaboration-FF4F00?style=for-the-badge&logo=liveblocks&logoColor=white" />
  <img src="https://img.shields.io/badge/Upstash-Redis-FF4438?style=for-the-badge&logo=upstash&logoColor=white" />
</p>

---

### 💡 What Is CODIVIR?

> **CODIVIR** is a premium, real-time collaborative **code editor and compiler**. It allows teams to write, synchronize, and execute code in over **28+ programming languages** simultaneously in a high-fidelity IDE environment.

Whether you're:
- 👩‍💻 **Pair programming with Live Presence**
- 🚀 **Sharing live, executable snippets**
- 🧠 **Teaching or learning together**
- 💬 **Showcasing complex multi-file logic**

CODIVIR is now **serverless-ready**, cinematic, and blazing fast ⚡

---

### 🚀 Key Features

*   **Liveblocks Collaboration**: Simultaneous editing with zero-latency synchronization, live cursor tracking, and presence indicators.
*   **Next.js 15 Native**: Optimized for the latest Next.js 15 App Router architecture.
*   **Dual-Pane IDE**: Toggle between a professional IDE layout for backend languages and a 2x2 grid for Web development (HTML/CSS/JS).
*   **Sandboxed Execution**: Powered by **Judge0 CE**, supporting the most popular and reliable programming languages.
*   **Instant Sharing**: Share your workspace instantly with unique hex-based URLs.
*   **Serverless Persistence**: Powered by **Upstash Redis** with JSON-serialized storage and 48-hour auto-expiration.
*   **Aesthetic UI**: Cinematic glassmorphism, smooth Framer Motion animations, and a branded loading sequence.

## 🛠️ Technical Stack

*   **Frontend**: Next.js 15 (App Router), React 19, Framer Motion, Tailwind CSS.
*   **Editor**: Monaco Editor (VS Code core).
*   **Collaboration**: Liveblocks (Presence, Storage, Broadcast).
*   **Storage**: Upstash Redis (Serverless-ready JSON store).
*   **Execution**: Judge0 CE API (Base64 UTF-8 payloads).

## 🏗️ Workflow: How it Works

1.  **Open Lab**: Start with a fresh editor or load an existing snippet.
2.  **Invite Team**: Share your URL to collaborate instantly with real-time cursor tracking.
3.  **Code & Sync**: Every keystroke is synced via Liveblocks. Presence indicators show who is typing in which pane.
4.  **Run & Ship**: Hit `Ctrl + Enter` to execute backend code via Judge0 or see live Web previews. Storage is persistent for 48 hours via Redis.

## ⚙️ Getting Started (Local)

1.  **Clone & Install**:
    ```bash
    git clone [repository-url]
    npm install
    ```
2.  **Environment Setup**:
    Create `.env.local` in the root:
    ```env
    REDIS_URL="your-upstash-url"
    REDIS_TOKEN="your-upstash-token"
    LIVEBLOCKS_TOKEN="your-liveblocks-secret-key"
    ```
3.  **Run**:
    ```bash
    npm run dev
    ```

## ☁️ Hosting Strategy (FREE)

*   **Deployment**: Deploy the entire application to **Vercel** with zero backend configuration needed.
*   **Database**: **Upstash Redis** (Global Free Tier).
*   **Collaboration**: **Liveblocks** (Free Tier).

---
Developed with ⚡ by Ishaan Ray.
<p align="center">
  <img src="https://img.icons8.com/fluency/48/code-file.png" /><br><br>
  <b>Code Together. Build Better.</b><br>
  <i>~ CODIVIR by Ishaan Ray</i>
</p>
