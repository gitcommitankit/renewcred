import axios from 'axios';
import { API_URL } from '@/lib/constants';

/**
 * ARCHITECTURE NOTE: Dual-Client Pattern
 * 
 * This project uses Redux Toolkit (RTK Query) for all primary data fetching and state management
 * (see `src/store/api/`). RTK Query provides automatic caching, background refetching, and tag invalidation.
 * 
 * This Axios client (`lib/api.ts`) exists specifically to handle the robust, queue-based 
 * token refresh interceptor logic (handling concurrent 401s, queuing requests while refreshing, etc.).
 * While RTK Query has its own baseQuery wrapper for refresh, the Axios interceptor pattern used here
 * is more robust for complex SPAs with many simultaneous requests.
 * 
 * Do NOT use this client for general API requests (GET/POST for standards, versions, etc.).
 * Always use the generated RTK Query hooks (e.g., `useGetAllStandardsQuery`).
 */
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// ---- Request Interceptor: attach access token ----
api.interceptors.request.use(
  (config) => {
    // Access token is stored in memory via Redux; read from localStorage as fallback
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---- Response Interceptor: handle 401 with token refresh ----
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip refresh for auth endpoints to avoid infinite loops
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/')
    ) {
      if (isRefreshing) {
        // Queue the request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post('/auth/refresh');
        const newAccessToken = data.data.accessToken;

        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', newAccessToken);
        }

        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Clear tokens and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('admin');
          window.location.href = '/admin/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
