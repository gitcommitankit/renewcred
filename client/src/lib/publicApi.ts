/**
 * Centralised server-side data-fetching helpers for all public React Server
 * Components (RSC).  Every fetch call here:
 *  - Is tagged so that `revalidateTag()` from /api/revalidate busts only the
 *    data that changed.
 *  - Falls back to a safe empty value on error — pages render gracefully and
 *    never crash at build time if the backend is unreachable.
 *  - Carries `revalidate: 3600` as the ISR safety net (re-fetches at most
 *    once per hour even if on-demand revalidation is never called).
 */

import type { Standard, Version, VersionSummary } from '@/types';
import { API_URL } from './constants';

// Standards list

export async function getPublishedStandards(): Promise<Standard[]> {
  try {
    const res = await fetch(`${API_URL}/standards`, {
      next: { tags: ['standards-list'], revalidate: 3600 },
    });
    if (!res.ok) return [];
    return (await res.json()).data ?? [];
  } catch {
    return [];
  }
}

// Single standard

export async function getStandard(slug: string): Promise<Standard | null> {
  try {
    const res = await fetch(`${API_URL}/standards/${slug}`, {
      next: { tags: ['standards-list', `standard-${slug}`], revalidate: 3600 },
    });
    if (!res.ok) return null;
    return (await res.json()).data ?? null;
  } catch {
    return null;
  }
}

// Version list for a standard

export async function getVersions(slug: string): Promise<VersionSummary[]> {
  try {
    const res = await fetch(`${API_URL}/standards/${slug}/versions`, {
      next: { tags: [`standard-${slug}`], revalidate: 3600 },
    });
    if (!res.ok) return [];
    return (await res.json()).data ?? [];
  } catch {
    return [];
  }
}

// Latest published version for a standard

export async function getLatestVersion(slug: string): Promise<Version | null> {
  try {
    const res = await fetch(`${API_URL}/standards/${slug}/versions/latest`, {
      next: { tags: [`standard-${slug}`], revalidate: 3600 },
    });
    if (!res.ok) return null;
    return (await res.json()).data ?? null;
  } catch {
    return null;
  }
}

// Specific version by slug

export async function getVersionBySlug(
  standardSlug: string,
  versionSlug: string
): Promise<Version | null> {
  try {
    const res = await fetch(`${API_URL}/standards/${standardSlug}/versions/${versionSlug}`, {
      next: {
        tags: [`standard-${standardSlug}`, `version-${standardSlug}-${versionSlug}`],
        revalidate: 3600,
      },
    });
    if (!res.ok) return null;
    return (await res.json()).data ?? null;
  } catch {
    return null;
  }
}

// generateStaticParams helpers

/**
 * Returns all published standard slugs for generateStaticParams in
 * /standards/[slug]/page.tsx.
 */
export async function getAllPublishedSlugs(): Promise<string[]> {
  const standards = await getPublishedStandards();
  return standards.map((s) => s.slug);
}

/**
 * Returns all published { slug, versionSlug } combos for generateStaticParams
 * in /standards/[slug]/[versionSlug]/page.tsx.
 */
export async function getAllPublishedVersionParams(): Promise<
  { slug: string; versionSlug: string }[]
> {
  const standards = await getPublishedStandards();

  const results = await Promise.all(
    standards.map(async ({ slug }) => {
      const versions = await getVersions(slug);
      return versions.map((v) => ({ slug, versionSlug: v.slug }));
    })
  );

  return results.flat();
}
