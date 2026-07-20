import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const createBaseQuery = (path = '') =>
  fetchBaseQuery({
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
