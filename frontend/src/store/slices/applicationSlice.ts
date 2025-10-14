import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { applicationService } from '../../services/applicationService';
import type { IntercasteMarriageInput, AtrocityReliefInput, VerifyMarriageDetailsForAuthorityInput, UpdateApplicationStatusInput } from '../../services/applicationService';

interface ApplicationState {
  loading: boolean;
  error: string | null;
  applications: Array<Record<string, unknown>>;
  currentApplication: Record<string, unknown> | null;
  timeline: Record<string, unknown> | null;
  verificationResult: Record<string, unknown> | null;
}

const initialState: ApplicationState = {
  loading: false,
  error: null,
  applications: [],
  currentApplication: null,
  timeline: null,
  verificationResult: null,
};

// Submit intercaste marriage application
export const submitIntercasteMarriageAsync = createAsyncThunk(
  'application/submitIntercasteMarriage',
  async (data: IntercasteMarriageInput, { rejectWithValue }) => {
    try {
      const response = await applicationService.submitIntercasteMarriage(data);
      console.log('Intercaste marriage application response:', response);
      toast.success('Application submitted');
      return response;
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to submit application';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Submit atrocity relief application
export const submitAtrocityReliefAsync = createAsyncThunk(
  'application/submitAtrocityRelief',
  async (data: AtrocityReliefInput, { rejectWithValue }) => {
    try {
      const response = await applicationService.submitAtrocityRelief(data);
      toast.success('Application submitted');
      return response;
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to submit application';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Verify marriage certificate
export const verifyMarriageCertificateAsync = createAsyncThunk(
  'application/verifyMarriageCertificate',
  async (data: { marriageRegistrationId: string }, { rejectWithValue }) => {
    try {
      const response = await applicationService.verifyMarriageCertificate(data);
      return response;
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to verify marriage certificate';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Check intercaste marriage
export const checkIntercasteMarriageAsync = createAsyncThunk(
  'application/checkIntercasteMarriage',
  async (data: { marriageRegistrationId: string }, { rejectWithValue }) => {
    try {
      const response = await applicationService.checkIntercasteMarriage(data);
      return response;
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to check intercaste marriage';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Get application status
export const getApplicationStatusAsync = createAsyncThunk(
  'application/getApplicationStatus',
  async (applicationId: string, { rejectWithValue }) => {
    try {
      const response = await applicationService.getApplicationStatus(applicationId);
      return response;
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to get application status';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Get application timeline
export const getApplicationTimelineAsync = createAsyncThunk(
  'application/getApplicationTimeline',
  async (applicationId: string, { rejectWithValue }) => {
    try {
      const response = await applicationService.getApplicationTimeline(applicationId);
      return response;
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to get application timeline';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Get user's applications
export const getMyApplicationsAsync = createAsyncThunk(
  'application/getMyApplications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await applicationService.getMyApplications();
      return response;
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to get applications';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Update application status (authority)
export const updateApplicationStatusAsync = createAsyncThunk(
  'application/updateApplicationStatus',
  async ({ applicationId, data }: { applicationId: string; data: UpdateApplicationStatusInput }, { rejectWithValue }) => {
    try {
      const response = await applicationService.updateApplicationStatus(applicationId, data);
      toast.success('Application updated');
      return response;
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update application';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Verify marriage details for authority
export const verifyMarriageDetailsForAuthorityAsync = createAsyncThunk(
  'application/verifyMarriageDetailsForAuthority',
  async (data: VerifyMarriageDetailsForAuthorityInput, { rejectWithValue }) => {
    try {
      const response = await applicationService.verifyMarriageDetailsForAuthority(data);
      return response;
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to verify marriage details';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Verify atrocity application for authority
export const verifyAtrocityApplicationForAuthorityAsync = createAsyncThunk(
  'application/verifyAtrocityApplicationForAuthority',
  async (applicationId: string, { rejectWithValue }) => {
    try {
      const response = await applicationService.verifyAtrocityApplicationForAuthority(applicationId);
      return response;
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to verify atrocity application';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const applicationSlice = createSlice({
  name: 'application',
  initialState,
  reducers: {
    clearApplicationError: (state) => {
      state.error = null;
    },
    clearCurrentApplication: (state) => {
      state.currentApplication = null;
      state.timeline = null;
      state.verificationResult = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitIntercasteMarriageAsync.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(submitIntercasteMarriageAsync.fulfilled, (state, action) => { state.loading = false; state.currentApplication = action.payload; state.error = null; })
      .addCase(submitIntercasteMarriageAsync.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

      .addCase(submitAtrocityReliefAsync.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(submitAtrocityReliefAsync.fulfilled, (state, action) => { state.loading = false; state.currentApplication = action.payload; state.error = null; })
      .addCase(submitAtrocityReliefAsync.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

      .addCase(verifyMarriageCertificateAsync.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(verifyMarriageCertificateAsync.fulfilled, (state, action) => { state.loading = false; state.verificationResult = action.payload; state.error = null; })
      .addCase(verifyMarriageCertificateAsync.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

      .addCase(checkIntercasteMarriageAsync.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(checkIntercasteMarriageAsync.fulfilled, (state, action) => { state.loading = false; state.verificationResult = action.payload; state.error = null; })
      .addCase(checkIntercasteMarriageAsync.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

      .addCase(getApplicationStatusAsync.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(getApplicationStatusAsync.fulfilled, (state, action) => { state.loading = false; state.currentApplication = action.payload; state.error = null; })
      .addCase(getApplicationStatusAsync.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

      .addCase(getApplicationTimelineAsync.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(getApplicationTimelineAsync.fulfilled, (state, action) => { state.loading = false; state.timeline = action.payload; state.error = null; })
      .addCase(getApplicationTimelineAsync.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

      .addCase(getMyApplicationsAsync.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(getMyApplicationsAsync.fulfilled, (state, action) => { state.loading = false; state.applications = action.payload || []; state.error = null; })
      .addCase(getMyApplicationsAsync.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

      .addCase(updateApplicationStatusAsync.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateApplicationStatusAsync.fulfilled, (state, action) => { state.loading = false; state.currentApplication = action.payload; state.error = null; })
      .addCase(updateApplicationStatusAsync.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

      .addCase(verifyMarriageDetailsForAuthorityAsync.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(verifyMarriageDetailsForAuthorityAsync.fulfilled, (state, action) => { state.loading = false; state.verificationResult = action.payload; state.error = null; })
      .addCase(verifyMarriageDetailsForAuthorityAsync.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

      .addCase(verifyAtrocityApplicationForAuthorityAsync.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(verifyAtrocityApplicationForAuthorityAsync.fulfilled, (state, action) => { state.loading = false; state.verificationResult = action.payload; state.error = null; })
      .addCase(verifyAtrocityApplicationForAuthorityAsync.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
  }
});

export const { clearApplicationError, clearCurrentApplication } = applicationSlice.actions;
export default applicationSlice.reducer;
