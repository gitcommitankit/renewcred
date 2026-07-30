import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { API_URL } from '@/lib/constants';
import { clearCredentials } from '@/store/slices/authSlice';

export const createBaseQuery = (path = '') => {
  const rawBaseQuery = fetchBaseQuery({
    baseUrl: `${API_URL}${path}`,
    credentials: 'include',
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
        } else {
          // Refresh failed — clear stale credentials so UI redirects to login.
          api.dispatch(clearCredentials());
        }
      }
    }

    return result;
  };

  return baseQueryWithReauth;
};
