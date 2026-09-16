// This file is for: Vehicle Redux Slice
// Module: Frontend State Management (Module 9)
// Owner: Developer 2 (Web Frontend Engineer)

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface VehicleState {
  vehicles: any[];
  selectedVehicle: any | null;
  loading: boolean;
}

const initialState: VehicleState = {
  vehicles: [],
  selectedVehicle: null,
  loading: false,
};

const vehicleSlice = createSlice({
  name: 'vehicle',
  initialState,
  reducers: {
    // Replaces the entire vehicle list in state
    setVehicles: (state, action: PayloadAction<any[]>) => {
      state.vehicles = action.payload;
    },
    // Sets a specific vehicle as the currently active/selected vehicle (e.g. for edit modal)
    selectVehicle: (state, action: PayloadAction<any | null>) => {
      state.selectedVehicle = action.payload;
    },
    // Updates a single vehicle's status locally (optimistic update/cache update)
    updateVehicleStatus: (state, action: PayloadAction<{ id: string; status: string }>) => {
      const { id, status } = action.payload;
      const index = state.vehicles.findIndex((v) => v._id === id || v.id === id);
      if (index !== -1) {
        state.vehicles[index].status = status;
      }
      
      // Also update selectedVehicle if it's the one being modified
      if (state.selectedVehicle && (state.selectedVehicle._id === id || state.selectedVehicle.id === id)) {
        state.selectedVehicle.status = status;
      }
    },
    // Explicitly set global loading state for vehicles
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setVehicles,
  selectVehicle,
  updateVehicleStatus,
  setLoading,
} = vehicleSlice.actions;

export default vehicleSlice.reducer;
