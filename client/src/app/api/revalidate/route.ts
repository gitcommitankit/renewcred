import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  adminId?: string;
  email?: string;
}

/**
 * POST /api/revalidate
 *
 * Called by RTK Query mutations after a successful admin write to bust the
 * Next.js ISR cache for public-facing pages.
 *
 * Secured via Admin JWT verification (via Authorization header or accessToken cookie).
 * Body: { paths: string[] }
 */
export async function POST(req: NextRequest) {
  try {
    // Extract access token from Cookie or Authorization header
    let token = req.cookies.get('accessToken')?.value;
    if (!token) {
      const authHeader = req.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    // Verify token using JWT_ACCESS_SECRET
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
      console.error('❌ JWT_ACCESS_SECRET environment variable is missing on client');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, secret) as JwtPayload;
    } catch {
      return NextResponse.json({ error: 'Unauthorized: Invalid or expired token' }, { status: 401 });
    }

    if (!decoded?.adminId) {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }

    // Revalidate paths
    const body = await req.json();
    const { paths } = body as { paths?: string[] };

    if (!Array.isArray(paths) || paths.length === 0) {
      return NextResponse.json({ error: 'paths must be a non-empty array' }, { status: 400 });
    }

    for (const path of paths) {
      if (typeof path === 'string' && path.startsWith('/')) {
        revalidatePath(path);
      }
    }

    return NextResponse.json({ revalidated: true, paths });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
