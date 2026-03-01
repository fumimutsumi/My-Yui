# My-Yui 個人ノート知識ベース

**[English](./README-en.md) | [简体中文](./README.md) | 日本語**

My-Yui は Vue3 + Node.js + SQLite で構築された個人ノート知識ベースシステムです。ノートの CRUD 操作、ツリー構造のカテゴリ、タグ管理、全文検索、Markdown レンダリングをサポートしています。個人知識管理に適しており、デスクトップアプリケーションとしてパッケージ化することも可能です。現在開発中です。

---

## 目次

- [My-Yui 個人ノート知識ベース](#my-yui-個人ノート知識ベース)
  - [目次](#目次)
  - [プロジェクト構成](#プロジェクト構成)
  - [クイックスタート](#クイックスタート)
    - [環境要件](#環境要件)
    - [環境ツールのインストール（OS別）](#環境ツールのインストールos別)
      - [macOS](#macos)
      - [Windows](#windows)
      - [Linux（Ubuntu/Debian の場合）](#linuxubuntudebian-の場合)
    - [プロジェクトのクローンと依存関係のインストール](#プロジェクトのクローンと依存関係のインストール)
    - [開発サーバーの起動](#開発サーバーの起動)
    - [開発プロキシ設定](#開発プロキシ設定)
  - [データバックアップ](#データバックアップ)
  - [実装済み機能と今後の予定](#実装済み機能と今後の予定)
    - [完了](#完了)
    - [今後の予定](#今後の予定)
  - [設定説明](#設定説明)
    - [データベーストークナイザー](#データベーストークナイザー)
    - [CORSとプロキシ](#corsとプロキシ)
  - [ライセンス](#ライセンス)

---

## プロジェクト構成

```
My-Yui/
├── backend/                     # バックエンドコード
│   ├── backups/                 # 手動バックアップされたデータベースファイル（除外）
│   ├── db/
│   │   └── index.js             # データベース接続と初期化
│   ├── routes/
│   │   ├── categories.js
│   │   ├── notes.js
│   │   └── tags.js
│   ├── services/                # （現在空）
│   ├── node_modules/            # 依存関係（除外）
│   ├── app.js
│   ├── server.js
│   ├── backup.js                # 手動バックアップスクリプト
│   ├── package-lock.json        
│   └── package.json             
├── frontend/                    # フロントエンドコード
│   ├── public/                  # 静的アセット
│   ├── node_modules/            # 依存関係（除外）
│   ├── src/
│   │   ├── api/
│   │   │   ├── request.js
│   │   │   ├── categories.js
│   │   │   ├── notes.js
│   │   │   └── tags.js
│   │   ├── assets/              # メディアリソース
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
│   ├── README.md                 # フロントエンド固有のドキュメント
│   ├── vite.config.js
│   ├── .gitignore                # フロントエンド固有の除外ファイル
│   ├── package-lock.json
│   └── package.json
├── data.db                       # SQLite データベースファイル（除外）
├── data.db-shm / data.db-wal     # WAL 一時ファイル（除外）
├── README.md                     # プロジェクトドキュメント（中国語）
├── README-en.md                  # プロジェクトドキュメント（英語）
├── README-ja.md                  # プロジェクトドキュメント（日本語）
└── .gitignore                    # グローバル Git 除外設定
```

---

## クイックスタート

### 環境要件
- **Node.js** （v16以上、v18+推奨）
- **npm** （Node.jsと共にインストール）または **yarn**
- **Git** （リポジトリのクローン用）

### 環境ツールのインストール（OS別）

#### macOS

1. **Homebrew のインストール**（他のツールのインストールに便利なので強く推奨）
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Git のインストール**
   - Homebrew を使用: `brew install git`
   - または [Git for macOS](https://git-scm.com/download/mac) インストーラーをダウンロード

3. **Node.js と npm のインストール**
   - Homebrew を使用: `brew install node`
   - または [Node.js 公式サイト](https://nodejs.org) から macOS インストーラー（.pkg）をダウンロードしてインストール

4. **インストールの確認**
   ```bash
   node -v
   npm -v
   git --version
   ```
   - バージョン番号が表示されればインストール成功です

#### Windows

1. **Git のインストール**
   - [Git for Windows](https://git-scm.com/download/win) インストーラーをダウンロードして実行
   - 「Git from the command line and also from 3rd-party software」を選択することを推奨（コマンドプロンプトで Git を使用可能にするため）

2. **Node.js と npm のインストール**
   - [Node.js 公式サイト](https://nodejs.org) にアクセスし、LTS バージョンの Windows インストーラー（.msi）をダウンロード
   - インストーラーを実行し、**必ず「Add to PATH」にチェックを入れる**
   - インストール完了後、コマンドプロンプト（CMD）または PowerShell を再起動して確認

3. **インストールの確認**
   ```cmd
   node -v
   npm -v
   git --version
   ```
   - バージョン番号が表示されればインストール成功です

**Windows Terminal または Git Bash**（Git と共にインストール）の使用を推奨します。

#### Linux（Ubuntu/Debian の場合）

1. **パッケージインデックスの更新**
   ```bash
   sudo apt update
   ```

2. **Git のインストール**
   ```bash
   sudo apt install git
   ```

3. **Node.js と npm のインストール**（NodeSource リポジトリを使用して最新 LTS を取得）
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   ```

4. **インストールの確認**
   ```bash
   node -v
   npm -v
   git --version
   ```

---

### プロジェクトのクローンと依存関係のインストール

以下のコマンドはすべての OS で共通です（ターミナルで実行）。

1. **リポジトリのクローン**
   ```bash
   git clone https://github.com/yourusername/My-Yui.git
   cd My-Yui
   ```

2. **バックエンドの依存関係をインストール**
   ```bash
   cd backend
   npm install
   ```
   *このコマンドは `package.json` に基づいて以下のバックエンド依存関係を自動的にインストールします:*
   - `express`: Web フレームワーク
   - `better-sqlite3`: SQLite ドライバー
   - `cors`: CORS サポート
   - `nodemon`（開発依存）: 開発時の自動再起動

3. **フロントエンドの依存関係をインストール**
   ```bash
   cd ../frontend
   npm install
   ```
   *このコマンドは以下のフロントエンド依存関係を自動的にインストールします:*
   - `vue`: コアライブラリ
   - `pinia`: 状態管理
   - `axios`: HTTP クライアント
   - `markdown-it`: Markdown レンダリング
   - `vite`（開発依存）: ビルドツール

4. **データベースの初期化**  
   バックエンドは初回起動時にデータベースファイル `data.db` とすべてのテーブルを自動的に作成し、FTS インデックスを再構築します。**手動操作は不要です**。

---

### 開発サーバーの起動

1. **バックエンドの起動**（デフォルトポート `3000`）- 1つ目のターミナルウィンドウ
   ```bash
   cd backend
   npm run dev   # nodemon で自動再起動（推奨）
   # または: node server.js（自動再起動なし）
   ```

2. **フロントエンドの起動**（デフォルトポート `5173`）- 2つ目のターミナルウィンドウ
   ```bash
   cd frontend
   npm run dev
   ```

3. **アプリケーションへのアクセス**  
   ブラウザで `http://localhost:5173` にアクセスしてアプリケーションを使用開始できます。

---

### 開発プロキシ設定

フロントエンド開発サーバーはプロキシ（`vite.config.js`）が設定されており、`/api` リクエストをバックエンドの `http://localhost:3000` に転送します。追加の設定は不要です。すべての API 呼び出しは相対パスを使用します。

---

## データバックアップ

プロジェクトには手動バックアップスクリプト `backend/backup.js` が用意されています。実行すると、`data.db` を `backend/backups/` ディレクトリにコピーし、ファイル名にタイムスタンプが含まれます。

```bash
cd backend
node backup.js
```

定期的に実行することを推奨します。また、cron（Linux/macOS）やタスクスケジューラ（Windows）を使用して自動化することもできます。

---

## 実装済み機能と今後の予定

### 完了
- [x] フロントエンドとバックエンドのアーキテクチャ
- [x] カテゴリ管理（ツリー構造）
- [x] タグ管理
- [x] ノート CRUD
- [x] 全文検索（短語最適化付き）
- [x] Markdown レンダリング（`NoteView.vue`）
- [x] 検索インタラクションの最適化（空入力時にボタンを無効化）
- [x] データベース WAL モード（信頼性向上）
- [x] 手動バックアップスクリプト

### 今後の予定
- [ ] ゴミ箱（ソフトデリートと復元）
- [ ] Markdown エディター（`md-editor-v3` などを統合）
- [ ] キーワードハイライト機能
- [ ] データのインポート/エクスポート（Markdown）
- [ ] UI の改善（Element Plus / Naive UI）
- [ ] Electron デスクトップアプリケーションのパッケージ化
- [ ] クラウドデプロイガイド

---

## 設定説明

### データベーストークナイザー

デフォルトの FTS5 トークナイザーは `unicode61` で、中国語、日本語、韓国語の文字や特殊記号（音楽記号など）をサポートしています。変更する場合は、`backend/db/index.js` の `CREATE VIRTUAL TABLE` ステートメントを修正し、インデックスを再構築してください（`notes_fts` テーブルを削除してからサーバーを再起動）。

### CORSとプロキシ

本番環境へのデプロイ時は、フロントエンドの静的ファイルがバックエンドサービスまたはリバースプロキシによって正しく API リクエストを転送するように設定するか、CORS を設定してください。

---

## ライセンス

なし

---

**ご利用ありがとうございます！ご質問やご提案がございましたら、Issue を投稿するか、メールでお問い合わせください。**
