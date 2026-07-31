import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/revalidate
 *
 * Called by RTK Query mutations after a successful admin write to bust the
 * Next.js ISR cache for public-facing pages.
 *
 * Temporarily unsecured to facilitate cross-domain revalidation.
 * Body: { paths: string[] }
 */
export async function POST(req: NextRequest) {
  try {
    // Revalidate paths and/or tags
    const body = await req.json();
    const { paths, tags } = body as { paths?: string[]; tags?: string[] };

    if (
      (!Array.isArray(paths) || paths.length === 0) &&
      (!Array.isArray(tags) || tags.length === 0)
    ) {
      return NextResponse.json(
        { error: 'At least one of paths or tags must be a non-empty array' },
        { status: 400 }
      );
    }

    for (const path of paths ?? []) {
      if (typeof path === 'string' && path.startsWith('/')) {
        revalidatePath(path);
      }
    }

    for (const tag of tags ?? []) {
      if (typeof tag === 'string' && tag.length > 0) {
        revalidateTag(tag, 'max');
      }
    }

    return NextResponse.json({ revalidated: true, paths, tags });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
