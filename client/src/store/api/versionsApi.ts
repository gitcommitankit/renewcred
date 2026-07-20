import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  ApiResponse,
  Version,
  VersionSummary,
  Section,
  CreateVersionInput,
  UpdateVersionInput,
  CreateSectionInput,
  UpdateSectionInput,
  ReorderSectionItem,
} from '@/types';

export const versionsApi = createApi({
  reducerPath: 'versionsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
    prepareHeaders: (headers) => {
      const token =
        typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Version', 'Section'],
  endpoints: (builder) => ({
    // ---- Public ----
    getVersionsByStandardSlug: builder.query<ApiResponse<VersionSummary[]>, string>({
      query: (slug) => `/standards/${slug}/versions`,
      providesTags: (_result, _error, slug) => [{ type: 'Version', id: `LIST-${slug}` }],
    }),

    getLatestVersion: builder.query<ApiResponse<Version>, string>({
      query: (slug) => `/standards/${slug}/versions/latest`,
      providesTags: (_result, _error, slug) => [{ type: 'Version', id: `LATEST-${slug}` }],
    }),

    getVersionBySlug: builder.query<
      ApiResponse<Version>,
      { standardSlug: string; versionSlug: string }
    >({
      query: ({ standardSlug, versionSlug }) =>
        `/standards/${standardSlug}/versions/${versionSlug}`,
      providesTags: (_result, _error, { versionSlug }) => [
        { type: 'Version', id: versionSlug },
      ],
    }),

    getSections: builder.query<ApiResponse<Section[]>, string>({
      query: (versionId) => `/versions/${versionId}/sections`,
      providesTags: (_result, _error, versionId) => [
        { type: 'Section', id: `LIST-${versionId}` },
      ],
    }),

    // ---- Admin ----
    getVersionById: builder.query<ApiResponse<Version>, string>({
      query: (id) => `/admin/versions/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Version', id }],
    }),

    createVersion: builder.mutation<
      ApiResponse<Version>,
      { standardId: string; data: CreateVersionInput }
    >({
      query: ({ standardId, data }) => ({
        url: `/admin/standards/${standardId}/versions`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Version', id: 'LIST' }],
    }),

    updateVersion: builder.mutation<
      ApiResponse<Version>,
      { id: string; data: UpdateVersionInput }
    >({
      query: ({ id, data }) => ({
        url: `/admin/versions/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Version', id },
        { type: 'Version', id: 'LIST' },
      ],
    }),

    deleteVersion: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/admin/versions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Version', id: 'LIST' }],
    }),

    // ---- Admin Sections ----
    createSection: builder.mutation<
      ApiResponse<Section>,
      { versionId: string; data: CreateSectionInput }
    >({
      query: ({ versionId, data }) => ({
        url: `/admin/versions/${versionId}/sections`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { versionId }) => [
        { type: 'Section', id: `LIST-${versionId}` },
      ],
    }),

    updateSection: builder.mutation<
      ApiResponse<Section>,
      { id: string; versionId: string; data: UpdateSectionInput }
    >({
      query: ({ id, data }) => ({
        url: `/admin/sections/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id, versionId }) => [
        { type: 'Section', id },
        { type: 'Section', id: `LIST-${versionId}` },
      ],
    }),

    deleteSection: builder.mutation<ApiResponse<null>, { id: string; versionId: string }>({
      query: ({ id }) => ({
        url: `/admin/sections/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { versionId }) => [
        { type: 'Section', id: `LIST-${versionId}` },
      ],
    }),

    reorderSections: builder.mutation<
      ApiResponse<null>,
      { versionId: string; sections: Array<ReorderSectionItem & { number: string }> }
    >({
      query: ({ versionId, sections }) => ({
        url: `/admin/versions/${versionId}/sections/reorder`,
        method: 'PUT',
        body: { sections },
      }),
      invalidatesTags: (_result, _error, { versionId }) => [
        { type: 'Section', id: `LIST-${versionId}` },
      ],
    }),
  }),
});

export const {
  useGetVersionsByStandardSlugQuery,
  useGetLatestVersionQuery,
  useGetVersionBySlugQuery,
  useGetSectionsQuery,
  useGetVersionByIdQuery,
  useCreateVersionMutation,
  useUpdateVersionMutation,
  useDeleteVersionMutation,
  useCreateSectionMutation,
  useUpdateSectionMutation,
  useDeleteSectionMutation,
  useReorderSectionsMutation,
} = versionsApi;
