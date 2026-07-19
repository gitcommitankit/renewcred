// ============================================================
// Shared TypeScript types for RenewCred CMS
// ============================================================

// ---- Auth ----

export interface Admin {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    admin: Admin;
  };
}

// ---- Standards ----

export interface Standard {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string | null;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { versions: number };
  versions?: VersionSummary[];
}

export interface CreateStandardInput {
  title: string;
  slug: string;
  description: string;
  icon?: string;
  sortOrder?: number;
  isPublished?: boolean;
}

export type UpdateStandardInput = Partial<CreateStandardInput>;

// ---- Versions ----

export type VersionStatus = 'DRAFT' | 'PUBLIC_CONSULTATION' | 'CERTIFIED';

export interface VersionSummary {
  id: string;
  standardId: string;
  versionLabel: string;
  slug: string;
  status: VersionStatus;
  certifiedAt: string | null;
  consultationStartDate: string | null;
  consultationEndDate: string | null;
  isLatest: boolean;
  createdAt: string;
}

export interface Version extends VersionSummary {
  updatedAt: string;
  sections: Section[];
  standard?: {
    id: string;
    title: string;
    slug: string;
  };
}

export interface CreateVersionInput {
  versionLabel: string;
  slug: string;
  status?: VersionStatus;
  isLatest?: boolean;
  certifiedAt?: string | null;
  consultationStartDate?: string | null;
  consultationEndDate?: string | null;
}

export type UpdateVersionInput = Partial<CreateVersionInput>;

// ---- Sections ----

export interface Section {
  id: string;
  versionId: string;
  number: string;
  title: string;
  slug: string;
  content: TiptapDocument;
  parentId: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  children?: Section[];
}

export interface CreateSectionInput {
  number: string;
  title: string;
  slug: string;
  content?: TiptapDocument;
  parentId?: string | null;
  sortOrder?: number;
}

export type UpdateSectionInput = Partial<CreateSectionInput>;

export interface ReorderSectionItem {
  id: string;
  sortOrder: number;
  parentId?: string | null;
}

// ---- Pages ----

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: TiptapDocument;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UpdatePageInput = {
  title?: string;
  content?: TiptapDocument;
  isPublished?: boolean;
};

// ---- Site Settings ----

export interface SiteSettings {
  id: string;
  siteName: string;
  tagline: string | null;
  address: string | null;
  email: string | null;
  phone: string | null;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  } | null;
  footerText: string | null;
  newsletterEnabled: boolean;
}

export type UpdateSettingsInput = Partial<Omit<SiteSettings, 'id'>>;

// ---- Tiptap ----

export interface TiptapDocument {
  type: 'doc';
  content: TiptapNode[];
}

export interface TiptapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  marks?: TiptapMark[];
  text?: string;
}

export interface TiptapMark {
  type: string;
  attrs?: Record<string, unknown>;
}

// ---- API Response ----

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  statusCode: number;
  message: string;
}

// ---- UI ----

export type ToastType = 'success' | 'error' | 'info' | 'warning';
