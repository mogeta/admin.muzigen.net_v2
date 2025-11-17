import { NextRequest, NextResponse } from 'next/server';
import { getAdminStorage } from '@/lib/firebase-admin';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    // FormDataから画像ファイルを取得
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが見つかりません' },
        { status: 400 }
      );
    }

    // ファイルタイプの検証
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: '画像ファイルのみアップロード可能です' },
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

    // 元の画像の拡張子を取得
    const originalExtension = file.name.split('.').pop() || 'jpg';
    const originalFileName = `${baseFileName}.${originalExtension}`;

    // WebPファイル名
    const webpFileName = `${baseFileName}.webp`;

    // Firebase Admin Storageのインスタンスを取得
    const storage = getAdminStorage();
    const bucket = storage.bucket();

    // 元の画像をアップロード
    const originalFile = bucket.file(`img/${originalFileName}`);
    await originalFile.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    });

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
    const webpUrl = `https://storage.googleapis.com/${bucket.name}/${webpFile.name}`;

    return NextResponse.json({
      success: true,
      url: webpUrl,
      fileName: baseFileName,
    });
  } catch (error) {
    console.error('画像アップロードエラー:', error);
    return NextResponse.json(
      { error: '画像のアップロードに失敗しました' },
      { status: 500 }
    );
  }
}
