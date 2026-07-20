import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  ApiResponse,
  Page,
  SiteSettings,
  UpdatePageInput,
  UpdateSettingsInput,
} from '@/types';

export const pagesApi = createApi({
  reducerPath: 'pagesApi',
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
  tagTypes: ['Page', 'Settings'],
  endpoints: (builder) => ({
    // ---- Public ----
    getPageBySlug: builder.query<ApiResponse<Page>, string>({
      query: (slug) => `/pages/${slug}`,
      providesTags: (_result, _error, slug) => [{ type: 'Page', id: slug }],
    }),

    getSettings: builder.query<ApiResponse<SiteSettings>, void>({
      query: () => '/settings',
      providesTags: [{ type: 'Settings', id: 'SINGLETON' }],
    }),

    // ---- Admin ----
    getAllPages: builder.query<ApiResponse<Page[]>, void>({
      query: () => '/admin/pages',
      providesTags: [{ type: 'Page', id: 'LIST' }],
    }),

    getPageById: builder.query<ApiResponse<Page>, string>({
      query: (id) => `/admin/pages/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Page', id }],
    }),

    updatePage: builder.mutation<
      ApiResponse<Page>,
      { id: string; data: UpdatePageInput }
    >({
      query: ({ id, data }) => ({
        url: `/admin/pages/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Page', id },
        { type: 'Page', id: 'LIST' },
      ],
    }),

    updateSettings: builder.mutation<ApiResponse<SiteSettings>, UpdateSettingsInput>({
      query: (data) => ({
        url: '/admin/settings',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: [{ type: 'Settings', id: 'SINGLETON' }],
    }),
  }),
});

export const {
  useGetPageBySlugQuery,
  useGetSettingsQuery,
  useGetAllPagesQuery,
  useGetPageByIdQuery,
  useUpdatePageMutation,
  useUpdateSettingsMutation,
} = pagesApi;
