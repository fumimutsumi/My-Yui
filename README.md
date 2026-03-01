# My-Yui 个人笔记知识库

**[English](./README-en.md) | 简体中文 | [日本語](./README-ja.md)**

My-Yui 是一个基于 Vue3 + Node.js + SQLite 的个人笔记知识库系统。它支持笔记的增删改查、树状分类、标签管理、全文搜索以及 Markdown 渲染，适合个人知识管理，并可封装为桌面应用。目前仍是半成品。

---

## 目录

- [My-Yui 个人笔记知识库](#my-yui-个人笔记知识库)
  - [目录](#目录)
  - [项目结构说明](#项目结构说明)
  - [快速开始](#快速开始)
    - [环境要求](#环境要求)
    - [安装环境工具（按操作系统）](#安装环境工具按操作系统)
      - [macOS](#macos)
      - [Windows](#windows)
      - [Linux（以 Ubuntu/Debian 为例）](#linux以-ubuntudebian-为例)
    - [克隆项目并安装依赖](#克隆项目并安装依赖)
    - [启动开发服务器](#启动开发服务器)
    - [开发代理配置](#开发代理配置)
  - [数据备份](#数据备份)
  - [已实现功能与待办](#已实现功能与待办)
    - [已完成](#已完成)
    - [待实现](#待实现)
  - [配置说明](#配置说明)
    - [数据库分词器](#数据库分词器)
    - [跨域与代理](#跨域与代理)
  - [许可证](#许可证)

---

## 项目结构说明

```
My-Yui/
├── backend/                     # 后端代码
│   ├── backups/                 # 手动备份的数据库文件（已忽略）
│   ├── db/
│   │   └── index.js             # 数据库连接与初始化
│   ├── routes/
│   │   ├── categories.js
│   │   ├── notes.js
│   │   └── tags.js
│   ├── services/                # （目前为空）
│   ├── node_modules/            # 依赖目录（已忽略）
│   ├── app.js
│   ├── server.js
│   ├── backup.js                # 手动备份脚本
│   ├── package-lock.json        
│   └── package.json             
├── frontend/                    # 前端代码
│   ├── public/                  # 静态资源
│   ├── node_modules/            # 依赖目录（已忽略）
│   ├── src/
│   │   ├── api/
│   │   │   ├── request.js
│   │   │   ├── categories.js
│   │   │   ├── notes.js
│   │   │   └── tags.js
│   │   ├── assets/              # 媒体资源
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
│   ├── README.md                 # 前端自身的说明文档
│   ├── vite.config.js
│   ├── .gitignore                # 前端专属忽略文件
│   ├── package-lock.json
│   └── package.json
├── data.db                       # SQLite 数据库文件（已忽略）
├── data.db-shm / data.db-wal     # WAL 临时文件（已忽略）
├── README.md                     # 项目说明文档（当前文件）
└── .gitignore                    # 全局 Git 忽略配置
```

---

## 快速开始

### 环境要求
- **Node.js** (v16 或更高，推荐 v18+)
- **npm**（随 Node.js 安装）或 **yarn**
- **Git**（用于克隆仓库）

### 安装环境工具（按操作系统）

#### macOS

1. **安装 Homebrew**（非常推荐，便于后续安装其他工具）
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **安装 Git**
   - 使用 Homebrew：`brew install git`
   - 或下载 [Git for macOS](https://git-scm.com/download/mac) 安装包。

3. **安装 Node.js 和 npm**
   - 使用 Homebrew：`brew install node`
   - 或从 [Node.js 官网](https://nodejs.org) 下载 macOS 安装包（.pkg）双击安装。

4. **验证安装**
   ```bash
   node -v
   npm -v
   git --version
   ```
   - 出现版本号则表示安装成功。

#### Windows

1. **安装 Git**
   - 下载 [Git for Windows](https://git-scm.com/download/win) 安装包，运行安装程序。
   - 建议选择“Git from the command line and also from 3rd-party software”，以便在命令提示符中使用 Git。

2. **安装 Node.js 和 npm**
   - 访问 [Node.js 官网](https://nodejs.org)，下载 LTS 版本的 Windows 安装包（.msi）。
   - 双击运行，**务必勾选“Add to PATH”**。
   - 安装完成后，重新打开命令提示符（CMD）或 PowerShell 验证。

3. **验证安装**
   ```cmd
   node -v
   npm -v
   git --version
   ```
   - 出现版本号则表示安装成功。

**推荐使用 Windows Terminal 或 Git Bash**（随 Git 安装）以获得更好的命令行体验。

#### Linux（以 Ubuntu/Debian 为例）

1. **更新包索引**
   ```bash
   sudo apt update
   ```

2. **安装 Git**
   ```bash
   sudo apt install git
   ```

3. **安装 Node.js 和 npm**（使用 NodeSource 仓库获取最新 LTS）
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   ```

4. **验证安装**
   ```bash
   node -v
   npm -v
   git --version
   ```

---

### 克隆项目并安装依赖

无论使用哪种操作系统，后续命令均通用（在终端中执行）。

1. **克隆仓库**
   ```bash
   git clone https://github.com/yourusername/My-Yui.git
   cd My-Yui
   ```

2. **安装后端依赖**
   ```bash
   cd backend
   npm install
   ```
   *这条命令会根据 `package.json` 自动安装以下后端依赖：*
   - `express`：Web 框架
   - `better-sqlite3`：SQLite 驱动
   - `cors`：跨域支持
   - `nodemon`（开发依赖）：开发时自动重启服务

3. **安装前端依赖**
   ```bash
   cd ../frontend
   npm install
   ```
   *这条命令会自动安装以下前端依赖：*
   - `vue`：核心库
   - `pinia`：状态管理
   - `axios`：HTTP 客户端
   - `markdown-it`：Markdown 渲染
   - `vite`（开发依赖）：构建工具

4. **初始化数据库**  
   后端首次启动时会自动创建数据库文件 `data.db` 和所有表，并重建 FTS 索引。**无需手动操作**。

---

### 启动开发服务器

1. **启动后端**（默认端口 `3000`）第一个终端窗口
   ```bash
   cd backend
   npm run dev   # 使用 nodemon 自动重启（推荐）
   # 或 node server.js（无自动重启）
   ```

2. **启动前端**（默认端口 `5173`）第二个终端窗口
   ```bash
   cd frontend
   npm run dev
   ```

3. **访问应用**  
   打开浏览器访问 `http://localhost:5173`，即可开始使用。

---

### 开发代理配置
前端开发服务器已配置代理（`vite.config.js`），将 `/api` 请求转发到后端 `http://localhost:3000`，无需额外配置。所有 API 调用均通过相对路径完成。

---

## 数据备份

项目提供了手动备份脚本 `backend/backup.js`，执行后将 `data.db` 复制到 `backend/backups/` 目录，文件名包含时间戳。

```bash
cd backend
node backup.js
```

建议定期执行，或使用 cron（Linux/macOS）、任务计划程序（Windows）自动化备份。

---

## 已实现功能与待办

### 已完成
- [x] 前后端基础架构
- [x] 分类管理（树状）
- [x] 标签管理
- [x] 笔记 CRUD
- [x] 全文搜索（含短词优化）
- [x] Markdown 渲染（`NoteView.vue`）
- [x] 搜索交互优化（空输入禁用按钮）
- [x] 数据库 WAL 模式（提升可靠性）
- [x] 手动备份脚本

### 待实现
- [ ] 回收站（软删除与恢复）
- [ ] Markdown 编辑器（集成 `md-editor-v3` 等）
- [ ] 关键词标记功能
- [ ] 数据导入/导出（Markdown）
- [ ] 界面美化（Element Plus / Naive UI）
- [ ] Electron 桌面应用封装
- [ ] 云端部署指南

---

## 配置说明

### 数据库分词器
默认 FTS5 分词器为 `unicode61`，支持中日韩字符及特殊符号（如乐理符号）。如需更改，请修改 `backend/db/index.js` 中的 `CREATE VIRTUAL TABLE` 语句，并重建索引（删除 `notes_fts` 表后重启服务）。

### 跨域与代理
生产环境部署时，请确保前端静态文件由后端服务或反向代理正确转发 API 请求，或配置 CORS。

---

## 许可证

暂无

---

**祝你使用愉快！如有问题或建议，欢迎提交 Issue，或直接邮件联系。**