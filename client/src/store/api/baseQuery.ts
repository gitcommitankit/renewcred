import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { API_URL, AUTH_COOKIE_MAX_AGE } from '@/lib/constants';

export const createBaseQuery = (path = '') => {
  const rawBaseQuery = fetchBaseQuery({
    baseUrl: `${API_URL}${path}`,
    credentials: 'include',
    prepareHeaders: (headers) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  });

  const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
    args,
    api,
    extraOptions
  ) => {
    let result = await rawBaseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
      const url = typeof args === 'string' ? args : args.url;
      if (!url.includes('/login') && !url.includes('/refresh')) {
        const refreshBaseQuery = fetchBaseQuery({
          baseUrl: `${API_URL}/auth`,
          credentials: 'include',
        });

        const refreshResult = await refreshBaseQuery(
          { url: '/refresh', method: 'POST' },
          api,
          extraOptions
        );

        if (refreshResult.data) {
          // The backend successfully refreshed and set new HttpOnly cookies.
          // Retry original query.
          result = await rawBaseQuery(args, api, extraOptions);
        }
      }
    }

    return result;
  };

  return baseQueryWithReauth;
};
