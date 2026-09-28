import { NextRequest, NextResponse } from 'next/server';
import { getAdminStorage, getAdminApp } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import sharp from 'sharp';
import { createR2GalleryStorage, R2ConfigurationError } from '@/lib/r2-gallery';
import { v4 as uuidv4 } from 'uuid';

// 最大ファイルサイズ: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// 許可する画像タイプ
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

// 許可する拡張子
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];

export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // Firebase認証トークンを検証
    const token = authHeader.split('Bearer ')[1];
    try {
      const adminApp = getAdminApp();
      const auth = getAuth(adminApp);
      await auth.verifyIdToken(token);
    } catch (authError) {
      console.error('認証エラー:', authError);
      return NextResponse.json(
        { error: '認証トークンが無効です' },
        { status: 401 }
      );
    }

    // FormDataから画像ファイルを取得
    const formData = await request.formData();
    const file = formData.get('file');
    const gallery = formData.get('gallery') === 'true';

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'ファイルが見つかりません' },
        { status: 400 }
      );
    }

    // ファイルサイズの検証
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `ファイルサイズは${MAX_FILE_SIZE / 1024 / 1024}MB以下にしてください` },
        { status: 400 }
      );
    }

    // ファイルタイプの検証
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: '許可されていない画像形式です。JPEG, PNG, GIF, WebP, SVGのみアップロード可能です。' },
        { status: 400 }
      );
    }

    // ファイル名の生成: [UUID]_[YYYYMMDDhhmmss]
    const uuid = uuidv4();
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T]/g, '')
      .split('.')[0];
    const baseFileName = `${uuid}_${timestamp}`;

    // ファイルをBufferに変換
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 元の画像の拡張子を取得・検証
    const originalExtension = file.name.split('.').pop()?.toLowerCase();
    if (!originalExtension || !ALLOWED_EXTENSIONS.includes(originalExtension)) {
      return NextResponse.json(
        { error: '許可されていない、または不明なファイル拡張子です。' },
        { status: 400 }
      );
    }
    const originalFileName = `${baseFileName}.${originalExtension}`;

    // WebPファイル名
    const webpFileName = `${baseFileName}.webp`;

    // Gallery variants are generated before storage writes; source dimensions are
    // bounded and EXIF orientation is applied. Ordinary uploads retain their API.
    if (gallery) {
      const galleryStorage = createR2GalleryStorage();
      const createImage = () => sharp(buffer, { limitInputPixels: 40_000_000 }).rotate();
      const full = await createImage().resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true }).webp({ quality: 85 }).toBuffer();
      const thumbnail = await createImage().resize({ width: 480, height: 480, fit: 'cover', withoutEnlargement: true }).webp({ quality: 75 }).toBuffer();
      const urls = await galleryStorage.upload(baseFileName, full, thumbnail);
      return NextResponse.json({ success: true, ...urls, fileName: baseFileName });
    }

    const bucket = getAdminStorage().bucket();

    // 元の画像をアップロード
    const originalFile = bucket.file(`img/${originalFileName}`);
    await originalFile.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    });

    // 元の画像を公開設定にする
    await originalFile.makePublic();

    // WebPに変換
    const webpBuffer = await sharp(buffer)
      .webp({ quality: 80 })
      .toBuffer();

    // WebP画像をアップロード
    const webpFile = bucket.file(`webp/${webpFileName}`);
    await webpFile.save(webpBuffer, {
      metadata: {
        contentType: 'image/webp',
      },
    });

    // WebP画像を公開設定にする
    await webpFile.makePublic();

    // WebP画像の公開URLを取得
    const webpUrl = webpFile.publicUrl();

    return NextResponse.json({
      success: true,
      url: webpUrl,
      fileName: baseFileName,
    });
  } catch (error) {
    if (error instanceof R2ConfigurationError) {
      console.error('R2 configuration error:', error.message);
      return NextResponse.json({ error: '画像ストレージの設定が未完了です。管理者がR2設定を確認してください。' }, { status: 503 });
    }
    console.error('画像アップロードエラー:', error);

    // エラーの詳細をログに記録
    if (error instanceof Error) {
      console.error('エラーメッセージ:', error.message);
      console.error('スタックトレース:', error.stack);
    }

    // クライアントには安全なエラーメッセージを返す
    return NextResponse.json(
      {
        error: '画像のアップロードに失敗しました',
        details: process.env.NODE_ENV === 'development' && error instanceof Error
          ? error.message
          : undefined,
      },
      { status: 500 }
    );
  }
}
