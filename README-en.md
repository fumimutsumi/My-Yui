# My-Yui Personal Notes Knowledge Base

**English | [简体中文](./README.md) | [日本語](./README-ja.md)**

My-Yui is a personal notes knowledge base system built with Vue3 + Node.js + SQLite. It supports CRUD operations for notes, tree-structured categories, tag management, full-text search, and Markdown rendering. It is suitable for personal knowledge management and can be packaged as a desktop application. Currently a work in progress.

---

## Table of Contents

- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
  - [Requirements](#requirements)
  - [Installing Environment Tools (by OS)](#installing-environment-tools-by-os)
  - [Clone Project and Install Dependencies](#clone-project-and-install-dependencies)
  - [Start Development Server](#start-development-server)
  - [Development Proxy Configuration](#development-proxy-configuration)
- [Data Backup](#data-backup)
- [Features & TODO](#features--todo)
- [Configuration](#configuration)
  - [Database Tokenizer](#database-tokenizer)
  - [CORS & Proxy](#cors--proxy)
- [License](#license)

---

## Project Structure

```
My-Yui/
├── backend/                     # Backend code
│   ├── backups/                 # Manually backed up database files (ignored)
│   ├── db/
│   │   └── index.js             # Database connection and initialization
│   ├── routes/
│   │   ├── categories.js
│   │   ├── notes.js
│   │   └── tags.js
│   ├── services/                # (Currently empty)
│   ├── node_modules/            # Dependencies (ignored)
│   ├── app.js
│   ├── server.js
│   ├── backup.js                # Manual backup script
│   ├── package-lock.json        
│   └── package.json             
├── frontend/                    # Frontend code
│   ├── public/                  # Static assets
│   ├── node_modules/            # Dependencies (ignored)
│   ├── src/
│   │   ├── api/
│   │   │   ├── request.js
│   │   │   ├── categories.js
│   │   │   ├── notes.js
│   │   │   └── tags.js
│   │   ├── assets/              # Media resources
│   │   ├── components/
│   │   │   ├── CategoryTree.vue
│   │   │   ├── TagManager.vue
│   │   │   ├── HelloWorld.vue   
│   │   │   ├── NotesList.vue
│   │   │   ├── NoteForm.vue
│   │   │   ├── NoteView.vue
│   │   │   └── SearchBar.vue
│   │   ├── stores/
│   │   │   ├── categories.js
│   │   │   ├── notes.js
│   │   │   └── tags.js
│   │   ├── App.vue
│   │   ├── main.js
│   │   └── style.css
│   ├── index.html
│   ├── README.md                 # Frontend-specific documentation
│   ├── vite.config.js
│   ├── .gitignore                # Frontend-specific ignore file
│   ├── package-lock.json
│   └── package.json
├── data.db                       # SQLite database file (ignored)
├── data.db-shm / data.db-wal     # WAL temporary files (ignored)
├── README.md                     # Project documentation (Chinese)
├── README-en.md                  # Project documentation (English)
└── .gitignore                    # Global Git ignore configuration
```

---

## Quick Start

### Requirements
- **Node.js** (v16 or higher, v18+ recommended)
- **npm** (installed with Node.js) or **yarn**
- **Git** (for cloning the repository)

### Installing Environment Tools (by OS)

#### macOS

1. **Install Homebrew** (highly recommended for installing other tools)
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Install Git**
   - Using Homebrew: `brew install git`
   - Or download the [Git for macOS](https://git-scm.com/download/mac) installer.

3. **Install Node.js and npm**
   - Using Homebrew: `brew install node`
   - Or download the macOS installer (.pkg) from [Node.js official website](https://nodejs.org).

4. **Verify Installation**
   ```bash
   node -v
   npm -v
   git --version
   ```
   - Version numbers indicate successful installation.

#### Windows

1. **Install Git**
   - Download the [Git for Windows](https://git-scm.com/download/win) installer and run it.
   - It's recommended to select "Git from the command line and also from 3rd-party software" to use Git in Command Prompt.

2. **Install Node.js and npm**
   - Visit [Node.js official website](https://nodejs.org) and download the LTS version Windows installer (.msi).
   - Run the installer and **make sure to check "Add to PATH"**.
   - After installation, reopen Command Prompt (CMD) or PowerShell to verify.

3. **Verify Installation**
   ```cmd
   node -v
   npm -v
   git --version
   ```
   - Version numbers indicate successful installation.

**Windows Terminal or Git Bash** (installed with Git) is recommended for a better command-line experience.

#### Linux (Ubuntu/Debian)

1. **Update Package Index**
   ```bash
   sudo apt update
   ```

2. **Install Git**
   ```bash
   sudo apt install git
   ```

3. **Install Node.js and npm** (using NodeSource repository for latest LTS)
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   ```

4. **Verify Installation**
   ```bash
   node -v
   npm -v
   git --version
   ```

---

### Clone Project and Install Dependencies

The following commands are universal across all operating systems (run in terminal).

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/My-Yui.git
   cd My-Yui
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```
   *This command automatically installs the following backend dependencies based on `package.json`:*
   - `express`: Web framework
   - `better-sqlite3`: SQLite driver
   - `cors`: CORS support
   - `nodemon` (dev dependency): Auto-restart during development

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```
   *This command automatically installs the following frontend dependencies:*
   - `vue`: Core library
   - `pinia`: State management
   - `axios`: HTTP client
   - `markdown-it`: Markdown rendering
   - `vite` (dev dependency): Build tool

4. **Initialize Database**  
   The backend will automatically create the database file `data.db` and all tables on first startup, and rebuild the FTS index. **No manual operation required**.

---

### Start Development Server

1. **Start Backend** (default port `3000`) - First terminal window
   ```bash
   cd backend
   npm run dev   # Use nodemon for auto-restart (recommended)
   # Or: node server.js (no auto-restart)
   ```

2. **Start Frontend** (default port `5173`) - Second terminal window
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the Application**  
   Open your browser and visit `http://localhost:5173` to start using the application.

---

### Development Proxy Configuration

The frontend development server has been configured with proxy (`vite.config.js`) to forward `/api` requests to the backend at `http://localhost:3000`. No additional configuration needed. All API calls use relative paths.

---

## Data Backup

The project provides a manual backup script `backend/backup.js`. When executed, it copies `data.db` to the `backend/backups/` directory with a timestamp in the filename.

```bash
cd backend
node backup.js
```

It's recommended to execute this regularly, or use cron (Linux/macOS) / Task Scheduler (Windows) for automated backups.

---

## Features & TODO

### Completed
- [x] Frontend and backend architecture
- [x] Category management (tree structure)
- [x] Tag management
- [x] Notes CRUD
- [x] Full-text search (with short term optimization)
- [x] Markdown rendering (`NoteView.vue`)
- [x] Search interaction optimization (disable button when input is empty)
- [x] Database WAL mode (improved reliability)
- [x] Manual backup script

### TODO
- [ ] Recycle bin (soft delete and restore)
- [ ] Markdown editor (integrate `md-editor-v3` etc.)
- [ ] Keyword highlighting feature
- [ ] Data import/export (Markdown)
- [ ] UI enhancement (Element Plus / Naive UI)
- [ ] Electron desktop application packaging
- [ ] Cloud deployment guide

---

## Configuration

### Database Tokenizer

The default FTS5 tokenizer is `unicode61`, which supports Chinese, Japanese, Korean characters and special symbols (such as music notation). To change it, modify the `CREATE VIRTUAL TABLE` statement in `backend/db/index.js` and rebuild the index (delete the `notes_fts` table and restart the server).

### CORS & Proxy

For production deployment, ensure frontend static files are served by the backend service or a reverse proxy that correctly forwards API requests, or configure CORS.

---

## License

None

---

**Happy using! If you have any questions or suggestions, feel free to submit an Issue or contact via email.**
