
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import type { User } from '../../types';
import { authService } from '../../services/authService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  sessionToken: string | null;
  aadhaarData: any;
  casteDetails: any;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
  sessionToken: null,
  aadhaarData: null,
  casteDetails: null,
};

// Step 1: Initiate Aadhaar registration (send OTP)
export const initiateRegistrationAsync = createAsyncThunk(
  'auth/initiateRegistration',
  async (data: { aadhaarNumber: string; mobileNumber: string }, { rejectWithValue }) => {
    try {
      const response = await authService.initiateRegistration(data);
      toast.success('OTP sent to mobile number');
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to send OTP';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Step 2: Verify OTP and get Aadhaar data
export const verifyOTPAndGetAadhaarDataAsync = createAsyncThunk(
  'auth/verifyOTPAndGetAadhaarData',
  async (data: { aadhaarNumber: string; mobileNumber: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await authService.verifyOTPAndGetAadhaarData(data);
      toast.success('Aadhaar verified');
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'OTP verification failed';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Step 3: Fetch caste certificate from DigiLocker
export const fetchCasteFromDigiLockerAsync = createAsyncThunk(
  'auth/fetchCasteFromDigiLocker',
  async (data: { sessionToken: string; aadhaarNumber: string }, { rejectWithValue }) => {
    try {
      const response = await authService.fetchCasteFromDigiLocker(data);
      console.log("digilocker", response)
      toast.success('Caste certificate fetched');
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch caste certificate';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Step 4: Complete registration (final step)
export const completeRegistrationAsync = createAsyncThunk(
  'auth/completeRegistration',
  async (data: { sessionToken: string; aadhaarNumber: string; mobileNumber: string; aadhaarData: any; casteDetails: any; documentUrl?: string }, { rejectWithValue }) => {
    try {
      const response = await authService.completeRegistration(data);
      localStorage.setItem('token', response.token);
      toast.success('Registration complete!');
      return response.user;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Login: Send OTP for login
export const sendLoginOTPAsync = createAsyncThunk(
  'auth/sendLoginOTP',
  async (data: { aadhaarNumber: string; mobileNumber: string }, { rejectWithValue }) => {
    try {
      const response = await authService.sendLoginOTP(data);
      toast.success('Login OTP sent');
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to send login OTP';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Login: Verify OTP
export const loginBeneficiaryAsync = createAsyncThunk(
  'auth/loginBeneficiary',
  async (data: { aadhaarNumber: string; mobileNumber: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await authService.loginBeneficiary(data);
      localStorage.setItem('token', response.token);
      toast.success('Login successful!');
      return response.user;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Get current user profile
export const getCurrentUserAsync = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getCurrentUser();
      
      return user;
    } catch (error: any) {
      localStorage.removeItem('token');
      return rejectWithValue('Session expired');
    }
  }
);

export const logoutAsync = createAsyncThunk(
  'auth/logout',
  async () => {
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
    return null;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.sessionToken = null;
      state.aadhaarData = null;
      state.casteDetails = null;
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Step 1: Initiate Aadhaar registration
      .addCase(initiateRegistrationAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initiateRegistrationAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.sessionToken = action.payload.sessionToken || null;
        state.error = null;
      })
      .addCase(initiateRegistrationAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Step 2: Verify OTP and get Aadhaar data
      .addCase(verifyOTPAndGetAadhaarDataAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOTPAndGetAadhaarDataAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.aadhaarData = action.payload.aadhaarData || action.payload;
        state.sessionToken = action.payload.sessionToken || state.sessionToken;
        state.error = null;
      })
      .addCase(verifyOTPAndGetAadhaarDataAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Step 3: Fetch caste certificate
      .addCase(fetchCasteFromDigiLockerAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCasteFromDigiLockerAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.casteDetails = action.payload.casteDetails || action.payload;
        state.error = null;
      })
      .addCase(fetchCasteFromDigiLockerAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Step 4: Complete registration
      .addCase(completeRegistrationAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeRegistrationAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(completeRegistrationAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Login: Send OTP
      .addCase(sendLoginOTPAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendLoginOTPAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.sessionToken = action.payload.sessionToken || null;
        state.error = null;
      })
      .addCase(sendLoginOTPAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Login: Verify OTP
      .addCase(loginBeneficiaryAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginBeneficiaryAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginBeneficiaryAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Get current user
      .addCase(getCurrentUserAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUserAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getCurrentUserAsync.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
        localStorage.removeItem('token');
      })
      // Logout
      .addCase(logoutAsync.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
        state.loading = false;
        state.sessionToken = null;
        state.aadhaarData = null;
        state.casteDetails = null;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
