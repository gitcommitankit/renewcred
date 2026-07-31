/**
 * Calls the Next.js on-demand revalidation endpoint to immediately bust
 * the ISR cache for the given public paths and/or fetch cache tags.
 *
 * - `paths`  bust the rendered HTML of a page (e.g. '/standards')
 * - `tags`   bust the fetch-level data cache for tagged requests in publicApi.ts
 *
 * Both should always be passed together so the page HTML and its underlying
 * data are invalidated in the same request.
 *
 * Errors are swallowed so that a cache-busting failure never blocks the
 * mutation's success toast or redirect. The ISR safety net (revalidate: 3600)
 * covers any missed invalidations.
 *
 * @param paths Absolute Next.js paths to revalidate, e.g. ['/standards', '/standards/ev']
 * @param tags  Fetch cache tags to revalidate, e.g. ['standards-list', 'standard-ev']
 */
export async function revalidatePublicPaths(paths: string[], tags: string[] = []): Promise<void> {
  if ((!paths || paths.length === 0) && tags.length === 0) return;

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

    const res = await fetch('/api/revalidate', {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ paths, tags }),
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
