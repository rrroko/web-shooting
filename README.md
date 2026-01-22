# Web Shooting (Docker LAMP Starter)

Docker 一発起動で **LAMP + HTML5 Canvas** の最小プレイアブルが動作するスターターです。  
提出要件（Docker一式 / DB接続 / ブラウザ操作）を満たし、計画書は `docs/PLAN.md` に含みます。

## 前提
- Docker Desktop（WSL2 / Linux backend）

## 使い方（クイックスタート）
```bash
# 1) .env を作成
cp .env.sample .env
# 値を必要に応じて調整

# 2) 起動
docker compose up -d --build

# 3) ブラウザで確認
# アプリ:      http://localhost:8080
# ゲーム:      http://localhost:8080/game.html
# phpMyAdmin:  http://localhost:8081
```
DBテスト: `http://localhost:8080/db_test.php` にランキング（初期データ）が表示されます。

## 構成
```
.
├─ docker-compose.yml
├─ .env.sample        # ← .env にコピーして使用
├─ php/               # PHP + Apache (pdo_mysql有効)
├─ mysql/
│  └─ initdb.d/      # 初回起動時にスキーマ投入
├─ htdocs/            # Webルート（ゲーム/テスト/API）
│  ├─ game.html
│  ├─ js/game.js
│  ├─ db_test.php
│  └─ api/save_score.php (stub)
└─ docs/
   └─ PLAN.md         # 計画書（提出用リンク先）
```

## 次のタスク
- `/api/save_score.php` を実装して、ゲーム終了時にスコアを保存
- 画像スプライト（assets/）を読み込み、四角描画を差し替え
- ステージ1の雑魚→ボス→リザルトまでを一連で通す

## GitHub への初回プッシュ例
```bash
git init
git add .
git commit -m "feat: initial LAMP + Canvas starter with plan"
git branch -M main
git remote add origin https://github.com/<your-account>/<repo-name>.git
git push -u origin main
```
`.env` はコミットされないよう `.gitignore` 済みです。必要なら `.env.sample` を調整してください。
