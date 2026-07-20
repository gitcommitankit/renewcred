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
    },

    clearCredentials(state) {
      state.admin = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },
  },
});

export const { setCredentials, clearCredentials } =
  authSlice.actions;

export default authSlice.reducer;
