import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts a date string (YYYY-MM-DD or ISO) or null/undefined to an ISO
 * datetime string, or null if the value is empty/invalid.
 *
 * Used to normalise HTML <input type="date"> values before sending to the API.
 */
export function toIsoOrNull(val: string | null | undefined): string | null {
  if (!val || typeof val !== 'string' || !val.trim()) return null;
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
