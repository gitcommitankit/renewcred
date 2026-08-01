import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from './baseQuery';
import { standardsApi } from './standardsApi';
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
  oldVersionSlug,
  includeList = false,
}: {
  standardSlug: string;
  versionSlug?: string;
  /** Previous slug — only set when a slug rename happened */
  oldVersionSlug?: string;
  includeList?: boolean;
}) {
  const paths: string[] = [];
  const tags: string[] = [`standard-${standardSlug}`];

  if (includeList) {
    paths.push('/standards');
    tags.push('standards-list');
  }

  paths.push(`/standards/${standardSlug}`);

  if (versionSlug) {
    paths.push(`/standards/${standardSlug}/${versionSlug}`);
    tags.push(`version-${standardSlug}-${versionSlug}`);
  }

  // If slug changed, bust the old path too so stale HTML is evicted
  if (oldVersionSlug && oldVersionSlug !== versionSlug) {
    paths.push(`/standards/${standardSlug}/${oldVersionSlug}`);
    tags.push(`version-${standardSlug}-${oldVersionSlug}`);
  }

  await revalidatePublicPaths(paths, tags);
}

export const versionsApi = createApi({
  reducerPath: 'versionsApi',
  baseQuery: createBaseQuery(),
  tagTypes: ['Version', 'Section', 'Standard'],
  endpoints: (builder) => ({
    // --- Public ---
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
      invalidatesTags: (_result, _error, { standardId, standardSlug }) => [
        { type: 'Version', id: `LIST-${standardSlug}` },
        { type: 'Standard', id: standardId },
      ],
      async onQueryStarted({ standardId, standardSlug }, { dispatch, queryFulfilled }) {
        try {
          const { data: res } = await queryFulfilled;
          dispatch(
            standardsApi.util.invalidateTags([
              { type: 'Standard', id: 'ADMIN_LIST' },
              { type: 'Standard', id: standardId },
            ])
          );
          const versionSlug = res?.data?.slug;
          // Creating a version doesn't add/remove a standard from /standards —
          // only the standard's own page and version list are affected.
          await revalidateVersionPaths({ standardSlug, versionSlug });
        } catch {
          /* mutation failed — nothing to revalidate */
        }
      },
    }),

    updateVersion: builder.mutation<
      ApiResponse<Version>,
      {
        id: string;
        data: UpdateVersionInput;
        standardSlug: string;
        standardId?: string;
        /** Slug before the edit — pass this to bust the old ISR path when a slug changes */
        oldVersionSlug?: string;
      }
    >({
      query: ({ id, data }) => ({
        url: `/admin/versions/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id, standardSlug, standardId }) => [
        { type: 'Version', id },
        { type: 'Version', id: `LIST-${standardSlug}` },
        ...(standardId ? [{ type: 'Standard' as const, id: standardId }] : []),
      ],
      async onQueryStarted(
        { standardId, standardSlug, oldVersionSlug },
        { dispatch, queryFulfilled }
      ) {
        try {
          const { data: res } = await queryFulfilled;
          dispatch(
            standardsApi.util.invalidateTags([
              { type: 'Standard', id: 'ADMIN_LIST' },
              ...(standardId ? [{ type: 'Standard' as const, id: standardId }] : []),
            ])
          );
          const newVersionSlug = res?.data?.slug;
          await revalidateVersionPaths({
            standardSlug,
            versionSlug: newVersionSlug,
            oldVersionSlug,
          });
        } catch {
          /* mutation failed — nothing to revalidate */
        }
      },
    }),

    deleteVersion: builder.mutation<
      ApiResponse<null>,
      { id: string; standardSlug: string; versionSlug: string; standardId?: string }
    >({
      query: ({ id }) => ({
        url: `/admin/versions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { standardSlug, standardId }) => [
        { type: 'Version', id: `LIST-${standardSlug}` },
        ...(standardId ? [{ type: 'Standard' as const, id: standardId }] : []),
      ],
      async onQueryStarted(
        { standardId, standardSlug, versionSlug },
        { dispatch, queryFulfilled }
      ) {
        try {
          await queryFulfilled;
          dispatch(
            standardsApi.util.invalidateTags([
              { type: 'Standard', id: 'ADMIN_LIST' },
              ...(standardId ? [{ type: 'Standard' as const, id: standardId }] : []),
            ])
          );
          await revalidateVersionPaths({ standardSlug, versionSlug, includeList: true });
        } catch {
          /* mutation failed — nothing to revalidate */
        }
      },
    }),

    // --- Admin Sections ---
    createSection: builder.mutation<
      ApiResponse<Section>,
      { versionId: string; data: CreateSectionInput; standardSlug?: string; versionSlug?: string }
    >({
      query: ({ versionId, data }) => ({
        url: `/admin/versions/${versionId}/sections`,
        method: 'POST',
        body: data,
      }),
      // Invalidate the Version so the sidebar re-fetches with the new section
      invalidatesTags: (_result, _error, { versionId }) => [{ type: 'Version', id: versionId }],
      async onQueryStarted({ versionId }, { dispatch, queryFulfilled }) {
        try {
          const { data: res } = await queryFulfilled;
          if (res?.data) {
            dispatch(
              versionsApi.util.updateQueryData('getVersionById', versionId, (draft) => {
                if (draft?.data?.sections) {
                  const exists = draft.data.sections.some((s) => s.id === res.data.id);
                  if (!exists) {
                    draft.data.sections.push(res.data);
                  }
                }
              })
            );
          }
        } catch {
          /* mutation failed */
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
      invalidatesTags: (_result, _error, { id, versionId }) => [
        { type: 'Section', id },
        { type: 'Version', id: versionId },
      ],
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
    // We update the RTK Query in-memory cache directly via updateQueryData upon success.
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
      async onQueryStarted({ id, versionId, data }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            versionsApi.util.updateQueryData('getVersionById', versionId, (draft) => {
              if (draft?.data?.sections) {
                const target = draft.data.sections.find((s) => s.id === id);
                if (target) {
                  if (data.title !== undefined) target.title = data.title;
                  if (data.content !== undefined) target.content = data.content;
                }
              }
            })
          );
        } catch {
          /* silent on auto-save error */
        }
      },
    }),

    deleteSection: builder.mutation<
      ApiResponse<null>,
      { id: string; versionId: string; standardSlug?: string; versionSlug?: string }
    >({
      query: ({ id }) => ({
        url: `/admin/sections/${id}`,
        method: 'DELETE',
      }),
      // Invalidate the full Version so the sidebar loses the deleted section
      invalidatesTags: (_result, _error, { versionId }) => [{ type: 'Version', id: versionId }],
    }),

    reorderSections: builder.mutation<
      ApiResponse<null>,
      {
        versionId: string;
        sections: Array<ReorderSectionItem & { number: string }>;
        standardSlug?: string;
        versionSlug?: string;
      }
    >({
      query: ({ versionId, sections }) => ({
        url: `/admin/versions/${versionId}/sections/reorder`,
        method: 'PUT',
        body: { sections },
      }),
      // Invalidate the full Version so the sidebar re-fetches with new order
      invalidatesTags: (_result, _error, { versionId }) => [{ type: 'Version', id: versionId }],
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
