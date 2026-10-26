import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const assets: Record<string, { path: string; type: string }> = {
  'ausglogo.jpg': { path: join(process.cwd(), 'img', 'ausglogo.jpg'), type: 'image/jpeg' },
  'image1.jpg': { path: join(process.cwd(), 'image1.jpg'), type: 'image/jpeg' },
  'image2.jpg': { path: join(process.cwd(), 'image2.jpg'), type: 'image/jpeg' },
  'image3.jpg': { path: join(process.cwd(), 'image3.jpg'), type: 'image/jpeg' },
  'image4.jpg': { path: join(process.cwd(), 'image4.jpg'), type: 'image/jpeg' },
  'image5.jpg': { path: join(process.cwd(), 'image5.jpg'), type: 'image/jpeg' },
};

export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const asset = assets[name];
  if (!asset) return new NextResponse('Not found', { status: 404 });

  try {
    const bytes = await readFile(/* turbopackIgnore: true */ asset.path);
    return new NextResponse(bytes, {
      headers: {
        'content-type': asset.type,
        'cache-control': 'public, max-age=86400, stale-while-revalidate=604800',
        'x-content-type-options': 'nosniff',
      },
    });
  } catch {
    return new NextResponse('Image unavailable', { status: 404 });
  }
}
