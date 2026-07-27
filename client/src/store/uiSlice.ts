// This file is for: UI State Redux Slice
// Module: Frontend State Management (Module 9)
// Owner: Developer 2 (Web Frontend Engineer)

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ModalState {
  isOpen: boolean;
  modalType: string | null;
  modalProps: Record<string, any>;
}

interface UiState {
  sidebarOpen: boolean;
  modalState: ModalState;
  globalLoading: boolean;
}

const initialState: UiState = {
  sidebarOpen: true, // Typically open by default on desktop
  modalState: {
    isOpen: false,
    modalType: null,
    modalProps: {},
  },
  globalLoading: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Toggles or sets the sidebar visibility state
    toggleSidebar: (state, action: PayloadAction<boolean | undefined>) => {
      if (action.payload !== undefined) {
        state.sidebarOpen = action.payload;
      } else {
        state.sidebarOpen = !state.sidebarOpen;
      }
    },
    // Opens a generic modal by type string, passing optional props
    openModal: (
      state,
      action: PayloadAction<{ modalType: string; modalProps?: Record<string, any> }>
    ) => {
      state.modalState.isOpen = true;
      state.modalState.modalType = action.payload.modalType;
      state.modalState.modalProps = action.payload.modalProps || {};
    },
    // Closes the currently active modal and clears its state
    closeModal: (state) => {
      state.modalState.isOpen = false;
      state.modalState.modalType = null;
      state.modalState.modalProps = {};
    },
    // Toggles the global full-screen loading spinner
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  openModal,
  closeModal,
  setGlobalLoading,
} = uiSlice.actions;

export default uiSlice.reducer;
