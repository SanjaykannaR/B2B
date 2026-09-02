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
  sidebarExpanded: boolean;
  modalState: ModalState;
  globalLoading: boolean;
}

const initialState: UiState = {
  sidebarOpen: true,
  sidebarExpanded: false,
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
    toggleSidebar: (state, action: PayloadAction<boolean | undefined>) => {
      if (action.payload !== undefined) {
        state.sidebarOpen = action.payload;
      } else {
        state.sidebarOpen = !state.sidebarOpen;
      }
    },
    toggleSidebarExpanded: (state) => {
      state.sidebarExpanded = !state.sidebarExpanded;
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
  toggleSidebarExpanded,
  openModal,
  closeModal,
  setGlobalLoading,
} = uiSlice.actions;

export default uiSlice.reducer;
