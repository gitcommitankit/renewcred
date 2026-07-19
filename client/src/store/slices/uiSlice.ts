import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  sidebarCollapsed: boolean;
  activeStandardId: string | null;
  activeVersionId: string | null;
}

const initialState: UiState = {
  sidebarCollapsed: false,
  activeStandardId: null,
  activeVersionId: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed(state, action: PayloadAction<boolean>) {
      state.sidebarCollapsed = action.payload;
    },
    setActiveStandard(state, action: PayloadAction<string | null>) {
      state.activeStandardId = action.payload;
    },
    setActiveVersion(state, action: PayloadAction<string | null>) {
      state.activeVersionId = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  setActiveStandard,
  setActiveVersion,
} = uiSlice.actions;

export default uiSlice.reducer;
