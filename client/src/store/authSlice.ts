import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { login as loginApi, LoginResponse } from '../services/authApi';

interface AuthState {
  user: LoginResponse['user'] | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('b2b_token'),
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const loginUser = createAsyncThunk<LoginResponse, { email: string; password: string }>(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await loginApi(email, password);
      localStorage.setItem('b2b_token', response.token);
      return response;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Login failed';
      return rejectWithValue(msg);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('b2b_token');
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
