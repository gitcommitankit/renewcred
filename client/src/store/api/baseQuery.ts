import { fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { AUTH_COOKIE_MAX_AGE } from '@/lib/constants';

export const createBaseQuery = (path = '') => {
  const rawBaseQuery = fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'}${path}`,
    credentials: 'include',
    prepareHeaders: (headers) => {
      const token = typeof window !== 'undefined'
        ? localStorage.getItem('accessToken')
        : null;
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
          baseUrl: `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'}/auth`,
          credentials: 'include',
        });

        const refreshResult = await refreshBaseQuery(
          { url: '/refresh', method: 'POST' },
          api,
          extraOptions
        );

        if (refreshResult.data) {
          const data = refreshResult.data as { data?: { accessToken?: string } };
          const newAccessToken = data?.data?.accessToken;
          if (newAccessToken && typeof window !== 'undefined') {
            localStorage.setItem('accessToken', newAccessToken);
            document.cookie = `accessToken=${newAccessToken}; path=/; max-age=${AUTH_COOKIE_MAX_AGE}; SameSite=Lax`;
          }
          // Retry original query with updated headers
          result = await rawBaseQuery(args, api, extraOptions);
        } else {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            document.cookie = 'accessToken=; path=/; max-age=0; SameSite=Lax';
          }
        }
      }
    }

    return result;
  };

  return baseQueryWithReauth;
};
