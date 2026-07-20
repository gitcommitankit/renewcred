import { createApi } from '@reduxjs/toolkit/query/react';
import type { Standard, ApiResponse, CreateStandardInput, UpdateStandardInput } from '@/types';
import { createBaseQuery } from './baseQuery';

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
    }),

    deleteStandard: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/admin/standards/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'Standard', id: 'LIST' },
        { type: 'Standard', id: 'ADMIN_LIST' },
      ],
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
