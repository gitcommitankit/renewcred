import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from './baseQuery';
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
  baseQuery: createBaseQuery(),
  tagTypes: ['Version', 'Section'],
  endpoints: (builder) => ({
    // ---- Public ----
    getVersionsByStandardSlug: builder.query<ApiResponse<VersionSummary[]>, string>({
      query: (slug) => `/standards/${slug}/versions`,
      providesTags: (_result, _error, slug) => [{ type: 'Version', id: `LIST-${slug}` }],
    }),


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
      // Invalidate the Version so the sidebar re-fetches with the new section
      invalidatesTags: (_result, _error, { versionId }) => [
        { type: 'Version', id: versionId },
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
      // Only update the individual section cache — do NOT invalidate the full
      // version or the section list. Editing content does not change the sidebar
      // tree structure, and we must not trigger a full refetch on every auto-save.
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Section', id },
      ],
    }),

    deleteSection: builder.mutation<ApiResponse<null>, { id: string; versionId: string }>({
      query: ({ id }) => ({
        url: `/admin/sections/${id}`,
        method: 'DELETE',
      }),
      // Invalidate the full Version so the sidebar loses the deleted section
      invalidatesTags: (_result, _error, { versionId }) => [
        { type: 'Version', id: versionId },
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
      // Invalidate the full Version so the sidebar re-fetches with new order
      invalidatesTags: (_result, _error, { versionId }) => [
        { type: 'Version', id: versionId },
      ],
    }),
  }),
});

export const {
  useGetVersionByIdQuery,
  useCreateVersionMutation,
  useUpdateVersionMutation,
  useDeleteVersionMutation,
  useCreateSectionMutation,
  useUpdateSectionMutation,
  useDeleteSectionMutation,
  useReorderSectionsMutation,
} = versionsApi;
