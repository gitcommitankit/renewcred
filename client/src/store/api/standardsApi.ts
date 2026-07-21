import { createApi } from '@reduxjs/toolkit/query/react';
import type { Standard, ApiResponse, CreateStandardInput, UpdateStandardInput } from '@/types';
import { createBaseQuery } from './baseQuery';
import { revalidatePublicPaths } from '@/lib/revalidate';

export const standardsApi = createApi({
  reducerPath: 'standardsApi',
  baseQuery: createBaseQuery(),
  tagTypes: ['Standard'],
  endpoints: (builder) => ({
    // ---- Admin ----
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
      invalidatesTags: [
        { type: 'Standard', id: 'LIST' },
        { type: 'Standard', id: 'ADMIN_LIST' },
      ],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          // New standard on the list page
          await revalidatePublicPaths(['/standards']);
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
        { type: 'Standard', id: 'LIST' },
        { type: 'Standard', id: 'ADMIN_LIST' },
      ],
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const slug = data?.data?.slug;
          const paths = ['/standards'];
          if (slug) paths.push(`/standards/${slug}`);
          await revalidatePublicPaths(paths);
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
      invalidatesTags: [
        { type: 'Standard', id: 'LIST' },
        { type: 'Standard', id: 'ADMIN_LIST' },
      ],
      async onQueryStarted({ slug }, { queryFulfilled }) {
        try {
          await queryFulfilled;
          await revalidatePublicPaths(['/standards', `/standards/${slug}`]);
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
