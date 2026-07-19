import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Standard, ApiResponse, CreateStandardInput, UpdateStandardInput } from '../../types';

export const standardsApi = createApi({
  reducerPath: 'standardsApi',
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
  tagTypes: ['Standard'],
  endpoints: (builder) => ({
    // ---- Public ----
    getPublishedStandards: builder.query<ApiResponse<Standard[]>, void>({
      query: () => '/standards',
      providesTags: [{ type: 'Standard', id: 'LIST' }],
    }),

    getStandardBySlug: builder.query<ApiResponse<Standard>, string>({
      query: (slug) => `/standards/${slug}`,
      providesTags: (_result, _error, slug) => [{ type: 'Standard', id: slug }],
    }),

    // ---- Admin ----
    getAllStandards: builder.query<ApiResponse<Standard[]>, void>({
      query: () => '/standards/admin/all',
      providesTags: [{ type: 'Standard', id: 'ADMIN_LIST' }],
    }),

    getStandardById: builder.query<ApiResponse<Standard>, string>({
      query: (id) => `/standards/admin/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Standard', id }],
    }),

    createStandard: builder.mutation<ApiResponse<Standard>, CreateStandardInput>({
      query: (body) => ({
        url: '/standards/admin',
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
        url: `/standards/admin/${id}`,
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
        url: `/standards/admin/${id}`,
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
  useGetPublishedStandardsQuery,
  useGetStandardBySlugQuery,
  useGetAllStandardsQuery,
  useGetStandardByIdQuery,
  useCreateStandardMutation,
  useUpdateStandardMutation,
  useDeleteStandardMutation,
} = standardsApi;
