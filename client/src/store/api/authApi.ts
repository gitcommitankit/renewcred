import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Admin, ApiResponse, LoginRequest } from '../../types';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/auth`,
    prepareHeaders: (headers) => {
      const token =
        typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation<
      ApiResponse<{ accessToken: string; refreshToken: string; admin: Admin }>,
      LoginRequest
    >({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
    }),

    logout: builder.mutation<ApiResponse<null>, void>({
      query: () => ({
        url: '/logout',
        method: 'POST',
      }),
    }),

    refresh: builder.mutation<
      ApiResponse<{ accessToken: string; refreshToken: string }>,
      { refreshToken: string }
    >({
      query: (body) => ({
        url: '/refresh',
        method: 'POST',
        body,
      }),
    }),

    getMe: builder.query<ApiResponse<Admin>, void>({
      query: () => '/me',
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation, useRefreshMutation, useGetMeQuery } =
  authApi;
