import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Admin } from '@/types';

interface AuthState {
  admin: Admin | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const getInitialState = (): AuthState => {
  return {
    admin: null,
    accessToken: null, // access token is no longer available in client memory on load
    isAuthenticated: false,
    isLoading: true,
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
