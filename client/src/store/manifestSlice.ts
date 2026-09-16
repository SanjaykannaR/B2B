// This file is for: Manifest Redux Slice
// Module: Frontend State Management (Module 9)
// Owner: Developer 2 (Web Frontend Engineer)

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ManifestState {
  manifests: any[];
  selectedManifest: any | null;
  filters: Record<string, any>;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

const initialState: ManifestState = {
  manifests: [],
  selectedManifest: null,
  filters: {},
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

const manifestSlice = createSlice({
  name: 'manifest',
  initialState,
  reducers: {
    // Sets the full list of manifests (usually after an API fetch)
    setManifests: (state, action: PayloadAction<any[]>) => {
      state.manifests = action.payload;
    },
    // Sets a specific manifest as currently selected/active (e.g. for modal viewing)
    selectManifest: (state, action: PayloadAction<any | null>) => {
      state.selectedManifest = action.payload;
    },
    // Updates query filters (e.g. status, client, date) and resets pagination to page 1
    setFilters: (state, action: PayloadAction<Record<string, any>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset to first page on new filter
    },
    // Clears all active filters
    clearFilters: (state) => {
      state.filters = {};
      state.pagination.page = 1;
    },
    // Allows updating pagination independently
    setPagination: (state, action: PayloadAction<Partial<ManifestState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
  },
});

export const {
  setManifests,
  selectManifest,
  setFilters,
  clearFilters,
  setPagination,
} = manifestSlice.actions;

export default manifestSlice.reducer;
