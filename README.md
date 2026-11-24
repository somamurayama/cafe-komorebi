# 森のカフェ こもれび（ポートフォリオ用LP）

新潟県の山あいにある**架空の**山小屋カフェのランディングページです。
HTML / CSS / 素のJavaScript のみで作っています（ビルド不要）。

## フォルダ構成

```
cafe-komorebi/
├─ index.html        … ページ本体
├─ css/style.css     … スタイル（スマホ優先・768px / 1024px で切り替え）
├─ js/main.js        … メニュー開閉・フェードイン・固定CTA・予約フォームのチェック
├─ images/favicon.svg
└─ vercel.json       … キャッシュ等のヘッダー設定
```

## ローカルで見る

`index.html` をブラウザで開くだけで表示できます。

## Vercel にデプロイ

**方法A：Vercel CLI**

```
cd cafe-komorebi
npx vercel        # プレビュー
npx vercel --prod # 本番
```

Framework Preset は「Other」、Build Command / Output Directory は空のままでOKです。

**方法B：GitHub 連携**

このフォルダを GitHub に push し、Vercel の「Add New → Project」でリポジトリを選択。
リポジトリ内のサブフォルダに置いた場合は **Root Directory** に `cafe-komorebi` を指定します。

## メモ

- 写真は Unsplash のフリー素材を URL で読み込んでいます（差し替える場合は `images/` に置いて `src` を変更）。
- 予約フォームはデモです。送信しても実際の予約・メール送信は行いません。本番運用する場合は Formspree などのフォームサービスや予約システムと接続してください。
- 電話番号・住所・お客様の声はすべて架空です。
