import { createApi } from '@reduxjs/toolkit/query/react';
import type { Standard, ApiResponse, CreateStandardInput, UpdateStandardInput } from '@/types';
import { createBaseQuery } from './baseQuery';
import { revalidatePublicPaths } from '@/lib/revalidate';

export const standardsApi = createApi({
  reducerPath: 'standardsApi',
  baseQuery: createBaseQuery(),
  tagTypes: ['Standard'],
  endpoints: (builder) => ({
    // --- Admin ---
    getAllStandards: builder.query<ApiResponse<Standard[]>, void>({
      query: () => '/admin/standards',
      providesTags: [{ type: 'Standard', id: 'ADMIN_LIST' }],
    }),

    getStandardById: builder.query<ApiResponse<Standard>, string>({
      query: (id) => `/admin/standards/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Standard', id }],
    }),

    createStandard: builder.mutation<ApiResponse<Standard>, CreateStandardInput>({
      query: (body) => ({
        url: '/admin/standards',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Standard', id: 'ADMIN_LIST' }],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          await revalidatePublicPaths(['/standards'], ['standards-list']);
        } catch {
          /* mutation failed — nothing to revalidate */
        }
      },
    }),

    updateStandard: builder.mutation<
      ApiResponse<Standard>,
      { id: string; data: UpdateStandardInput }
    >({
      query: ({ id, data }) => ({
        url: `/admin/standards/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Standard', id },
        { type: 'Standard', id: 'ADMIN_LIST' },
      ],
      async onQueryStarted({ id: _id, data: inputData }, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const newSlug = data?.data?.slug;
          const oldSlug = inputData.slug;
          const paths = ['/standards'];
          const tags: string[] = ['standards-list'];
          if (newSlug) {
            paths.push(`/standards/${newSlug}`);
            tags.push(`standard-${newSlug}`);
          }
          // If slug changed, also bust the old slug's path
          if (oldSlug && oldSlug !== newSlug) {
            paths.push(`/standards/${oldSlug}`);
            tags.push(`standard-${oldSlug}`);
          }
          await revalidatePublicPaths(paths, tags);
        } catch {
          /* mutation failed — nothing to revalidate */
        }
      },
    }),

    deleteStandard: builder.mutation<ApiResponse<null>, { id: string; slug: string }>({
      query: ({ id }) => ({
        url: `/admin/standards/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Standard', id: 'ADMIN_LIST' }],
      async onQueryStarted({ slug }, { queryFulfilled }) {
        try {
          await queryFulfilled;
          await revalidatePublicPaths(
            ['/standards', `/standards/${slug}`],
            ['standards-list', `standard-${slug}`]
          );
        } catch {
          /* mutation failed — nothing to revalidate */
        }
      },
    }),
  }),
});

export const {
  useGetAllStandardsQuery,
  useGetStandardByIdQuery,
  useCreateStandardMutation,
  useUpdateStandardMutation,
  useDeleteStandardMutation,
} = standardsApi;
