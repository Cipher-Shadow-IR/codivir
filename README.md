<p align="center">
  <img src="public/resources/codivirlogo.png" width="220" alt="CODIVIR Logo">
</p>

<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Cambria&size=28&duration=5000&color=00FFFF&center=true&vCenter=true&width=1000&height=70&lines=CODIVIR+-+Collaborative+Code+Sharing+Platform;Real-time+Multi-Language+Compiler;Built+with+Next.js,+TypeScript+%26+SQLite" alt="Typing SVG" />
</p>

<h2 align="center">💻 Code. Collaborate. Share. Instantly.</h2>

---

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-Frontend-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-Logic-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/SQLite-Database-003B57?style=for-the-badge&logo=sqlite&logoColor=white" />
</p>

---

### 💡 What Is CODIVIR?

> **CODIVIR** is a premium, real-time collaborative **code editor and compiler**. It allows teams to write, synchronize, and execute code in over **28+ programming languages** simultaneously in a high-fidelity IDE environment.

Whether you're:
- 👩‍💻 **Pair programming in real-time**
- 🚀 **Sharing live, executable snippets**
- 🧠 **Teaching or learning together**
- 💬 **Showcasing complex multi-file logic**

CODIVIR makes it seamless, cinematic, and blazing fast ⚡

---

### 🧩 Supported Languages

- 🌐 **Web**: HTML, CSS, JavaScript (Live Preview Iframe)
- ⚙️ **Systems**: C, C++, Rust, Go, Zig, Nim
- 🐍 **Scripting**: Python, Ruby, Lua, Perl, PHP, Bash, R
- ☕ **JVM**: Java, Kotlin, Scala, Groovy, Clojure
- 💎 **Typed**: TypeScript, C#, Swift, Dart, F#
- 🗄️ **Database & Functional**: SQL (SQLite), Haskell, Elixir, Julia, Erlang, OCaml

---

### 📂 Folder Blueprint

```plaintext
📁 CODIVIR/
├── 📂 src/ app/           # Next.js Frontend
│   ├── 📂 components/      # EditorComponent (Monaco + Judge0 Logic)
│   ├── 📄 page.tsx         # Branded Landing Page
│   └── 📄 globals.css      # IDE Styling & Custom Themes
├── 📂 backend/            # Express + Socket.io Server
│   ├── 📄 server.js        # Real-time sync & SQLite persistence
│   └── 📄 database.sqlite  # Local database storage
├── 📄 package.json
└── 📄 README.md
```

---

### 🛠️ Tech Stack & Workflow

* **Frontend**: Next.js 15 (App Router), React 19, Framer Motion (Animations).
* **Editor**: Monaco Editor (The core of VS Code).
* **Real-time**: Socket.io for live cursor/sync and typing indicators.
* **Execution**: **Judge0 CE API** — Sandboxed execution with Base64 encoding.
* **Persistence**: SQLite for lightweight, transient snippet storage.

---

### ⚡ Implemented Features

 * ✅ **28+ Language Support** with specialized IDE vs Web layouts.
 * ✅ **Real-time Cursor Sync** & "Dev_XXX" name labels.
 * ✅ **Typing Indicators** per language pane.
 * ✅ **Live Web Preview** with instant refresh.
 * ✅ **Integrated Terminal** capturing `stdout` and `stderr`.
 * ✅ **Branded Page Loader** and high-fidelity UI animations.
 * ✅ **Snippet Persistence** using unique 8-character hex IDs.

---

### 🚀 Getting Started (How to Run)

#### **1. Clone the Repository**
```bash
git clone https://github.com/Cipher-Shadow-IR/codivir.git
cd ir-code-sharing
```

#### **2. Backend Setup**
Navigate to the `backend` folder and start the Socket.io server.
```bash
cd backend
npm install
npm run dev
```
*The backend runs on `http://localhost:8080` by default.*

#### **3. Frontend Setup**
In a new terminal window, navigate back to the root and start the Next.js dev server.
```bash
npm install
npm run dev
```
*The app will be available at `http://localhost:3000`.*

---

### 🙌 Credits

* **Ishaan Ray (Cipher Shadow IR)** – Design, Code & Vision
* **Next.js, Tailwind, Monaco, SQLite** – Core technologies
* **Judge0** – Powering the world-class code execution engine

---

<p align="center">
  <img src="https://img.icons8.com/fluency/48/code-file.png" /><br><br>
  <b>Code Together. Build Better.</b><br>
  <i>~ CODIVIR by Ishaan Ray</i>
</p>

