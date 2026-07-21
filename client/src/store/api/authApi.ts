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

    getMe: builder.query<ApiResponse<Admin>, void>({
      query: () => '/me',
    }),

    logout: builder.mutation<ApiResponse<null>, void>({
      query: () => ({
        url: '/logout',
        method: 'POST',
      }),
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation, useGetMeQuery } =
  authApi;
