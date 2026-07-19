import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Admin } from '../../types';

interface AuthState {
  admin: Admin | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const getInitialState = (): AuthState => {
  if (typeof window === 'undefined') {
    return {
      admin: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,
    };
  }

  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  const adminRaw = localStorage.getItem('admin');
  const admin = adminRaw ? (JSON.parse(adminRaw) as Admin) : null;

  return {
    admin,
    accessToken,
    refreshToken,
    isAuthenticated: !!accessToken && !!admin,
    isLoading: false,
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ admin: Admin; accessToken: string; refreshToken: string }>
    ) {
      const { admin, accessToken, refreshToken } = action.payload;
      state.admin = admin;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      state.isLoading = false;

      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('admin', JSON.stringify(admin));
        // Write cookie for Next.js middleware (Edge cannot read localStorage)
        document.cookie = `accessToken=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      }
    },

    updateTokens(
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string }>
    ) {
      const { accessToken, refreshToken } = action.payload;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;

      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
      }
    },

    clearCredentials(state) {
      state.admin = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;

      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('admin');
        // Clear the cookie too
        document.cookie = 'accessToken=; path=/; max-age=0; SameSite=Lax';
      }
    },

    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
});

export const { setCredentials, updateTokens, clearCredentials, setLoading } =
  authSlice.actions;

export default authSlice.reducer;
