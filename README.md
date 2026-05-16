# ⚡ Collab Editor

A full-stack real-time collaborative code editor where multiple users can write, edit, and execute code simultaneously in shared rooms — similar to Google Docs, but for code.

## 🚀 Live Demo

🔗 [collab-editor-inky.vercel.app](https://collab-editor-inky.vercel.app)

---

## ✨ Features

- **Real-time collaboration** — Multiple users can edit the same file simultaneously with instant sync via WebSockets
- **Code execution** — Run JavaScript, Python, TypeScript, Java, C++, and Go directly in the browser
- **Room-based sessions** — Create a room and share the link for others to join instantly
- **Live user presence** — See who's online with color-coded user indicators and live count
- **Room chat** — Built-in real-time chat panel for collaborators in the same room
- **Dashboard** — Manage your rooms with create, rename, delete, and recently joined rooms
- **Shareable links** — One-click copy of room ID or full shareable URL to invite collaborators
- **JWT Authentication** — Secure register/login with token-based auth and bcrypt password hashing
- **Auto-save** — Save code to MongoDB with Ctrl+S or the Save button with unsaved changes indicator
- **Language support** — Switch between JavaScript, TypeScript, Python, Java, C++, and Go with live sync across all users
- **Font size controls** — Adjustable editor font size (10px–24px)
- **Monaco Editor** — Powered by the same engine as VS Code

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js, TypeScript, Monaco Editor |
| Real-time | Socket.IO (WebSockets) |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcrypt |
| Code Execution | Custom sandboxed execution server (Node.js child_process) |
| Deployment | Vercel (frontend), Render (backend), MongoDB Atlas |
| DevOps | Docker, Docker Compose, Git |

---

## 🏗️ Architecture

```
┌─────────────┐        WebSocket         ┌──────────────────────┐
│  Browser A  │◄──────────────────────►  │                      │
│ (Monaco Ed) │                           │   Node.js Server     │
└─────────────┘     Socket.IO rooms       │   (Express +         │
                                          │    Socket.IO)        │
┌─────────────┐                           │                      │
│  Browser B  │◄──────────────────────►  │   Room State Manager │
│ (Monaco Ed) │                           │   + Chat Handler     │
└─────────────┘                           └──────────┬───────────┘
                                                     │
┌─────────────┐                                      │ Mongoose
│  Browser C  │◄──────────────────────►              ▼
│ (Monaco Ed) │                          ┌──────────────────────┐
└─────────────┘                          │     MongoDB Atlas    │
                                         │  (Document Storage)  │
                                         └──────────────────────┘
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas account)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Omkar74-rgb/Collab_Editor.git
cd collab-editor
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create `server/.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/collab-editor
JWT_SECRET=your_secret_key_here
CLIENT_URL=http://localhost:3000
```

Start the backend:
```bash
npm run dev
```

Server runs at `http://localhost:5000`

### 3. Frontend Setup

```bash
cd client
npm install
npm start
```

App runs at `http://localhost:3000`

### 4. Docker (Full Stack — One Command)

```bash
docker-compose up --build
```

Spins up MongoDB + backend + frontend together.

---

## 📁 Project Structure

```
collab-editor/
├── server/
│   ├── src/
│   │   ├── index.ts               # Entry point, Express + Socket.IO setup
│   │   ├── models/
│   │   │   ├── User.ts            # User schema with bcrypt hashing
│   │   │   └── Document.ts        # Document/room schema
│   │   ├── routes/
│   │   │   ├── auth.ts            # Register & login routes
│   │   │   ├── documents.ts       # CRUD + recent rooms routes
│   │   │   └── execute.ts         # Code execution route
│   │   ├── middleware/
│   │   │   └── auth.ts            # JWT protect middleware
│   │   └── socket/
│   │       └── collabHandler.ts   # WebSocket event handlers
│   ├── Dockerfile
│   ├── tsconfig.json
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CollabEditor.tsx   # Main editor with toolbar
│   │   │   ├── Dashboard.tsx      # Room management dashboard
│   │   │   ├── LoginPage.tsx      # Auth page (login/register)
│   │   │   ├── RoomPage.tsx       # Room wrapper + socket init
│   │   │   ├── ChatPanel.tsx      # Real-time chat sidebar
│   │   │   ├── OutputPanel.tsx    # Code execution output panel
│   │   │   └── ShareModal.tsx     # Room share modal
│   │   ├── services/
│   │   │   └── codeRunner.ts      # Code execution service
│   │   ├── config.ts              # API URL config (dev/prod)
│   │   └── App.tsx                # Router setup
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml
```

---

## 🔐 Environment Variables

### Server (`server/.env`)

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing (generate with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`) |
| `CLIENT_URL` | Frontend URL for CORS (e.g. `http://localhost:3000`) |

---

## 🚀 Deployment

| Service | Platform | Notes |
|---------|----------|-------|
| Frontend | Vercel | Auto-deploys on push to `main` |
| Backend | Render | Auto-deploys on push to `main` |
| Database | MongoDB Atlas | Free M0 cluster |

### Deploy Your Own

1. **MongoDB Atlas** — Create free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. **Render** — Connect GitHub repo, set root to `server`, build command `npm install --include=dev && npm run build`, start command `node dist/index.js`
3. **Vercel** — Connect GitHub repo, set root to `client`, framework to Create React App

---

## 🧠 How It Works

### Real-time Sync
When a user types in the editor, the change is emitted via `code-change` Socket.IO event to the server. The server updates the in-memory room state and broadcasts the new content to all other users in the room via `code-update` — excluding the sender to prevent echo loops.

### Room State Management
Active rooms and their content are stored in-memory on the server using `Map` data structures for O(1) access. On user disconnect, rooms with zero users are cleaned up automatically. Document content is persisted to MongoDB on explicit save.

### Code Execution
Code is written to a temporary file on the server, executed using Node.js `child_process.exec` with a 5-second timeout, and the output is streamed back to the client. Temp files are cleaned up after execution.

### Authentication
JWT tokens are issued on register/login with a 7-day expiry. Tokens are sent via `Authorization: Bearer <token>` header on REST requests and via Socket.IO `auth` option on WebSocket connections.


## 👨‍💻 Author

**Omkar Dayanand Dorugade**  
B.E. in Artificial Intelligence and Data Science  
D. Y. Patil College of Engineering and Innovation, Varale

📧 omkardorugade007@gmail.com  
🔗 [GitHub](https://github.com/Omkar74-rgb) • [LinkedIn](www.linkedin.com/in/omkar-dorugade-a32648399)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).