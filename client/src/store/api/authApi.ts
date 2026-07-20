import { createApi } from '@reduxjs/toolkit/query/react';
import type { Admin, ApiResponse, LoginRequest } from '@/types';
import { createBaseQuery } from './baseQuery';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: createBaseQuery('/auth'),
  endpoints: (builder) => ({
    login: builder.mutation<
      ApiResponse<{ accessToken: string; admin: Admin }>,
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
      ApiResponse<{ accessToken: string }>,
      void
    >({
      query: () => ({
        url: '/refresh',
        method: 'POST',
      }),
    }),

    getMe: builder.query<ApiResponse<Admin>, void>({
      query: () => '/me',
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation, useRefreshMutation, useGetMeQuery } =
  authApi;
