/**
 * Calls the Next.js on-demand revalidation endpoint to immediately bust
 * the ISR cache for the given public paths.
 *
 * Authenticates using the admin's JWT token (via Cookie or Bearer header).
 * This is fire-and-forget: errors are swallowed so that a cache-busting
 * failure never blocks the mutation's success toast or redirect.
 *
 * @param paths Absolute Next.js paths to revalidate, e.g. ['/standards', '/standards/ev']
 */
export async function revalidatePublicPaths(paths: string[]): Promise<void> {
  if (!paths || paths.length === 0) return;

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
    const endpoint = siteUrl ? `${siteUrl.replace(/\/$/, '')}/api/revalidate` : '/api/revalidate';

    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ paths }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('Cache busting failed:', errorData);
    }
  } catch (error) {
    console.error('Failed to contact revalidation endpoint:', error);
    // Intentionally swallowed — revalidation failure is non-fatal.
    // The ISR safety net (revalidate: 3600) will cover it.
  }
}
