# 📖 English Log

スマホブラウザで使える英語学習トラッキングアプリ。

## 機能

- **学習ログ** — Podcast・動画・オンライン英会話・読書などを記録
- **フレーズ帳** — 学んだ表現をメモ。学習ログと紐付け可能
- **統計** — 週間・月間の学習時間グラフ、アクティビティ別の内訳
- **ホーム** — 連続学習日数（ストリーク）、今日のサマリー
- **エクスポート/インポート** — JSONでデータをバックアップ・移行

## セットアップ

```bash
git clone https://github.com/YOUR_USERNAME/english-learning-app.git
cd english-learning-app
npm install
npm run dev
```

ブラウザで http://localhost:5173 を開く。

## GitHub Pages へのデプロイ

### 方法1: GitHub Actions（推奨）

1. GitHubにリポジトリを作成してプッシュ
2. リポジトリの **Settings → Pages → Source** で `GitHub Actions` を選択
3. `main` ブランチにプッシュすると自動でデプロイ

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/english-learning-app.git
git push -u origin main
```

### 方法2: gh-pages コマンド

vite.config.js の base を '/english-learning-app/' に変更してから:

```bash
npm run deploy
```

## データについて

データはブラウザの localStorage に保存されます。
統計画面のエクスポート機能でJSONバックアップを取っておくことをおすすめします。

## 技術スタック

- React 19 + Vite
- Tailwind CSS v4
- Recharts（グラフ）
- localStorage（データ保存）
