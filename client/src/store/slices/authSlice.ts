import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Admin } from '@/types';

interface AuthState {
  admin: Admin | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const getInitialState = (): AuthState => {
  if (typeof window === 'undefined') {
    return {
      admin: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,
    };
  }

  const accessToken = localStorage.getItem('accessToken');
  const adminRaw = localStorage.getItem('admin');
  const admin = adminRaw ? (JSON.parse(adminRaw) as Admin) : null;

  return {
    admin,
    accessToken,
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
      action: PayloadAction<{ admin: Admin; accessToken: string }>
    ) {
      const { admin, accessToken } = action.payload;
      state.admin = admin;
      state.accessToken = accessToken;
      state.isAuthenticated = true;
      state.isLoading = false;

      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('admin', JSON.stringify(admin));
        // Write cookie for Next.js middleware (Edge cannot read localStorage)
        document.cookie = `accessToken=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      }
    },

    updateTokens(
      state,
      action: PayloadAction<{ accessToken: string }>
    ) {
      const { accessToken } = action.payload;
      state.accessToken = accessToken;

      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', accessToken);
      }
    },

    clearCredentials(state) {
      state.admin = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;

      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
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
