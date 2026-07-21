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
import { revalidatePublicPaths } from '@/lib/revalidate';

async function revalidateVersionPaths({
  standardSlug,
  versionSlug,
  includeList = false,
}: {
  standardSlug: string;
  versionSlug?: string;
  includeList?: boolean;
}) {
  const paths = includeList ? ['/standards'] : [];
  paths.push(`/standards/${standardSlug}`);
  if (versionSlug) {
    paths.push(`/standards/${standardSlug}/${versionSlug}`);
  }
  await revalidatePublicPaths(paths);
}

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
      { standardId: string; data: CreateVersionInput; standardSlug: string }
    >({
      query: ({ standardId, data }) => ({
        url: `/admin/standards/${standardId}/versions`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { standardSlug }) => [
        { type: 'Version', id: `LIST-${standardSlug}` },
      ],
      async onQueryStarted({ standardSlug }, { queryFulfilled }) {
        try {
          const { data: res } = await queryFulfilled;
          const versionSlug = res?.data?.slug;
          await revalidateVersionPaths({ standardSlug, versionSlug, includeList: true });
        } catch {
          /* mutation failed — nothing to revalidate */
        }
      },
    }),

    updateVersion: builder.mutation<
      ApiResponse<Version>,
      { id: string; data: UpdateVersionInput; standardSlug: string }
    >({
      query: ({ id, data }) => ({
        url: `/admin/versions/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id, standardSlug }) => [
        { type: 'Version', id },
        { type: 'Version', id: `LIST-${standardSlug}` },
      ],
      async onQueryStarted({ standardSlug, data: inputData }, { queryFulfilled }) {
        try {
          const { data: res } = await queryFulfilled;
          const versionSlug = res?.data?.slug;
          const paths = ['/standards', `/standards/${standardSlug}`];
          if (versionSlug) {
            paths.push(`/standards/${standardSlug}/${versionSlug}`);
          }
          if (inputData.slug && inputData.slug !== versionSlug) {
            paths.push(`/standards/${standardSlug}/${inputData.slug}`);
          }
          await revalidatePublicPaths(paths);
        } catch {
          /* mutation failed — nothing to revalidate */
        }
      },
    }),

    deleteVersion: builder.mutation<
      ApiResponse<null>,
      { id: string; standardSlug: string; versionSlug: string }
    >({
      query: ({ id }) => ({
        url: `/admin/versions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { standardSlug }) => [
        { type: 'Version', id: `LIST-${standardSlug}` },
      ],
      async onQueryStarted({ standardSlug, versionSlug }, { queryFulfilled }) {
        try {
          await queryFulfilled;
          await revalidateVersionPaths({ standardSlug, versionSlug, includeList: true });
        } catch {
          /* mutation failed — nothing to revalidate */
        }
      },
    }),

    // ---- Admin Sections ----
    createSection: builder.mutation<
      ApiResponse<Section>,
      { versionId: string; data: CreateSectionInput; standardSlug: string; versionSlug: string }
    >({
      query: ({ versionId, data }) => ({
        url: `/admin/versions/${versionId}/sections`,
        method: 'POST',
        body: data,
      }),
      // Invalidate the Version so the sidebar re-fetches with the new section
      invalidatesTags: (_result, _error, { versionId }) => [{ type: 'Version', id: versionId }],
      async onQueryStarted({ standardSlug, versionSlug }, { queryFulfilled }) {
        try {
          await queryFulfilled;
          await revalidateVersionPaths({ standardSlug, versionSlug });
        } catch {
          /* mutation failed — nothing to revalidate */
        }
      },
    }),

    updateSection: builder.mutation<
      ApiResponse<Section>,
      {
        id: string;
        versionId: string;
        data: UpdateSectionInput;
        standardSlug: string;
        versionSlug: string;
      }
    >({
      query: ({ id, data }) => ({
        url: `/admin/sections/${id}`,
        method: 'PUT',
        body: data,
      }),
      // Only update the individual section cache — do NOT invalidate the full
      // version or the section list. Editing content does not change the sidebar
      // tree structure, and we must not trigger a full refetch on every auto-save.
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Section', id }],
      async onQueryStarted({ standardSlug, versionSlug }, { queryFulfilled }) {
        try {
          await queryFulfilled;
          await revalidateVersionPaths({ standardSlug, versionSlug });
        } catch {
          /* mutation failed — nothing to revalidate */
        }
      },
    }),

    // Silent auto-save — same API call as updateSection but no ISR revalidation.
    // Revalidation on every debounced keystroke would hammer the cache unnecessarily;
    // the manual Save button (which calls updateSection) is what busts the cache.
    autoSaveSection: builder.mutation<
      ApiResponse<Section>,
      { id: string; versionId: string; data: UpdateSectionInput }
    >({
      query: ({ id, data }) => ({
        url: `/admin/sections/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Section', id }],
      // Intentionally no onQueryStarted — auto-saves must not bust the ISR cache.
    }),

    deleteSection: builder.mutation<
      ApiResponse<null>,
      { id: string; versionId: string; standardSlug: string; versionSlug: string }
    >({
      query: ({ id }) => ({
        url: `/admin/sections/${id}`,
        method: 'DELETE',
      }),
      // Invalidate the full Version so the sidebar loses the deleted section
      invalidatesTags: (_result, _error, { versionId }) => [{ type: 'Version', id: versionId }],
      async onQueryStarted({ standardSlug, versionSlug }, { queryFulfilled }) {
        try {
          await queryFulfilled;
          await revalidateVersionPaths({ standardSlug, versionSlug });
        } catch {
          /* mutation failed — nothing to revalidate */
        }
      },
    }),

    reorderSections: builder.mutation<
      ApiResponse<null>,
      {
        versionId: string;
        sections: Array<ReorderSectionItem & { number: string }>;
        standardSlug: string;
        versionSlug: string;
      }
    >({
      query: ({ versionId, sections }) => ({
        url: `/admin/versions/${versionId}/sections/reorder`,
        method: 'PUT',
        body: { sections },
      }),
      // Invalidate the full Version so the sidebar re-fetches with new order
      invalidatesTags: (_result, _error, { versionId }) => [{ type: 'Version', id: versionId }],
      async onQueryStarted({ standardSlug, versionSlug }, { queryFulfilled }) {
        try {
          await queryFulfilled;
          await revalidateVersionPaths({ standardSlug, versionSlug });
        } catch {
          /* mutation failed — nothing to revalidate */
        }
      },
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
  useAutoSaveSectionMutation,
  useDeleteSectionMutation,
  useReorderSectionsMutation,
} = versionsApi;
