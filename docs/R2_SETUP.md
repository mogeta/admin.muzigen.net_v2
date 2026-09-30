# ギャラリー画像のCloudflare R2 / CDN設定

新規ギャラリー画像は管理画面のサーバーでWebPへ変換し、R2に保存します。記事には公開用独自ドメインのURLを保存します。閲覧時はCloudflare CDN → R2という経路になり、管理画面サーバーは経由しません。WorkersやCloudflare Imagesは不要です。

通常の1枚ずつの画像挿入と既存のFirebase Storage画像は変更しません。過去の画像を自動移行する処理はありません。Firebaseのログインと記事保存も継続します。

## 1. R2と画像用ドメイン（人間が設定）

1. CloudflareでR2を有効化し、Standardストレージのバケットを作ります。名前の例は `muzigen-blog-images`。通常のグローバルエンドポイントを使うバケットを選んでください。
2. 同じCloudflareアカウントで `muzigen.net` のDNSゾーンを管理できる状態にします。現在別のDNSサービスを使っている場合、既存レコードを維持してCloudflareへのDNS移行を別途行う必要があります。
3. R2バケット → Settings → Custom Domainsから `images.muzigen.net` を接続し、証明書とドメインがActiveになるのを待ちます。この名前は提案です。別名を使う場合は下記環境変数も合わせます。
4. 本番配信に `r2.dev` を使わないでください。カスタムドメインを使えば `r2.dev` の公開を有効にする必要はありません。
5. `.webp` はCloudflareの標準キャッシュ対象です。このホストの既存Cache Rulesでキャッシュをバイパスしていないか確認します。アプリは `Cache-Control: public, max-age=31536000, immutable` を設定します。必要ならこのホストの `/gallery/` を対象にキャッシュを有効化し、オリジンのCache-Controlを尊重するルールを設定します。

このバケットには公開する画像だけを置いてください。ギャラリーを下書き保存中でも、アップロード済み画像はURLから閲覧可能です。

## 2. アップロード用の認証情報（人間が発行）

R2 → Manage R2 API Tokensから、対象バケットだけに **Object Read & Write** を許可したトークンを作成します。Account API Tokenが利用できる場合は継続運用用にそちらを使えます。表示された **Access Key ID** と **Secret Access Key** を保存してください。通常のCloudflare API Token文字列とは異なります。

バケット管理権限は不要です。失敗したアップロードを取り消すため、オブジェクト削除も行います。

## 3. 管理画面の環境変数（人間が追加）

| 名前 | 値 | Secretとして扱うか |
| --- | --- | --- |
| `R2_ACCOUNT_ID` | CloudflareアカウントID（32桁の16進数） | 通常設定 |
| `R2_BUCKET_NAME` | バケット名。例 `muzigen-blog-images` | 通常設定 |
| `R2_ACCESS_KEY_ID` | R2トークン発行時のAccess Key ID | Secret |
| `R2_SECRET_ACCESS_KEY` | R2トークン発行時のSecret Access Key | Secret |
| `R2_PUBLIC_BASE_URL` | `https://images.muzigen.net` | 通常設定 |

5つとも **管理画面を動かしているホスティングサービスのサーバー環境変数** に設定して再デプロイします。Vercelの場合はProject → Settings → Environment Variablesで対象環境を選択します。Previewでもアップロードを試すならPreview環境にも設定してください。ローカル開発では `.env.local` に追加します。テンプレートは `.env.r2.example` です。

**GitHub Secretsへ追加するだけでは、稼働中の管理画面には反映されません。** 現在のGitHub Actionsはテストのみで、この変更のためにGitHub Secretsを追加する必要はありません。将来GitHub Actionsからデプロイする場合は、その処理からランタイムへ渡す設定が別途必要です。

R2認証情報に `NEXT_PUBLIC_` を付けないでください。公開Blog側に追加Secretは不要です。既存のFirebase環境変数はそのまま必要です。R2の設定は実際のアップロード時に読み込むので、ビルド・自動テストに本番R2 Secretは不要です。

`R2_PUBLIC_BASE_URL` はHTTPSの独自ドメインだけを指定します。パス・クエリ・認証情報・S3 API URL・`r2.dev` は受け付けません。ブラウザからR2へ直接PUTしないため、今回の画像表示/アップロードにR2のCORS設定は不要です。

## 4. リリースと手動確認

1. Cloudflare設定と環境変数を追加。
2. 公開Blog PR #25を先に反映し、続いて管理画面PR #17を反映。
3. 管理画面でギャラリー画像を1枚アップロード。返されたURLが独自ドメインの `/gallery/…webp` と `/gallery/…_thumb.webp` になっていることを確認。
4. R2に2ファイルが作られ、Firebase Storageに新規ギャラリー画像が作られていないことを確認。
5. プレビューで一覧と拡大を確認。返された実際の画像URLに `curl -sS -D - -o /dev/null '画像URL'` を複数回実行し、`Content-Type: image/webp`、`Cache-Control`、キャッシュ後の `CF-Cache-Status: HIT` を確認。
6. 記事を公開し、公開Blogを再ビルドして実際の記事でも確認。

アップロード用Secretとバケットが未設定の段階では、実サービスへのアップロード・DNS・CDNキャッシュの疎通は未検証です。自動テストはS3 APIをモックして変換後データ・URL・キャッシュ指定・部分失敗時の削除を確認します。Playwrightは使用しません。

設定が不足するとギャラリーAPIは503を返します。Firebase Storageへの自動フォールバックは行いません。通信失敗では成功URLを返さず、同じ試行の2ファイルを削除しようとします。削除も失敗した場合はサーバーログに記録します。通常の「画像の除外」は記事内の参照を削除するだけで、保存済み画像の自動削除は行いません。

## 公式資料

- [R2 S3 SDK設定](https://developers.cloudflare.com/r2/examples/aws/aws-sdk-js-v3/)
- [APIトークンの作成と権限](https://developers.cloudflare.com/r2/api/tokens/)
- [独自ドメインとキャッシュ](https://developers.cloudflare.com/r2/buckets/public-buckets/)
