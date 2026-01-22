# 計画書 — Webシューティングゲーム（提出用たたき台）

## 作成内容
Webブラウザ上で遊べるステージ制のシューティングゲームを制作する。

## 開発環境（Docker一式）
- LAMP（Linux, Apache, MySQL, PHP）
- Docker / docker-compose により誰でも同じ環境を起動可能
- フロントエンド：HTML5 Canvas + JavaScript（ドット絵スプライト）
- DB：MySQL（プレイヤー/スコア管理）

## 仕様（特徴）
- ステージ制（3〜5段で難易度上昇）
- ランキング（総合／ステージ別）
- ニックネーム（ユーザー名）入力 → スコアと紐付け保存
- ゲーム操作：矢印キー移動、スペースでショット、Pでポーズ
- 敵/プレイヤーは画像（ドット絵）で表現

## ステージ構成（暫定）
- 3ステージ：雑魚ウェーブを全滅 → ボス出現
- ギミック例：瞬間移動、分裂、弾のパターン変化（放射/蛇行/狙い撃ち など）

## データベース（最小）
- `players`（id, nickname, created_at）
- `scores`（id, player_id, stage, score, created_at）

## 進め方
1. Docker環境と最小プレイアブル（このリポジトリに同梱）
2. スコア保存API（/api/save_score.php）実装
3. ランキングUIとボス/ギミックの追加
4. 画像スプライト差し替え、効果音、バランス調整

## 提出物
- 本計画書（docs/PLAN.md）へのリンクを「提出物管理シート」に記載
- Docker一式（docker-compose.yml ほか）
- ブラウザ操作：`http://localhost:8080/game.html` 動作確認可、DB接続テスト可
