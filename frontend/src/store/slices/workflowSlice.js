import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../services/api';

// Async thunks
export const fetchWorkflows = createAsyncThunk(
  'workflow/fetchWorkflows',
  async (params, { rejectWithValue }) => {
    try {
      const response = await apiService.getWorkflows(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchWorkflow = createAsyncThunk(
  'workflow/fetchWorkflow',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.getWorkflow(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createWorkflow = createAsyncThunk(
  'workflow/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiService.createWorkflow(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateWorkflow = createAsyncThunk(
  'workflow/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateWorkflow(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const approveWorkflowStep = createAsyncThunk(
  'workflow/approveStep',
  async ({ workflowId, stepId, data }, { rejectWithValue }) => {
    try {
      const response = await apiService.approveWorkflowStep(workflowId, stepId, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const rejectWorkflowStep = createAsyncThunk(
  'workflow/rejectStep',
  async ({ workflowId, stepId, data }, { rejectWithValue }) => {
    try {
      const response = await apiService.rejectWorkflowStep(workflowId, stepId, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  workflows: [],
  currentWorkflow: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },
  loading: false,
  error: null
};

const workflowSlice = createSlice({
  name: 'workflow',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentWorkflow: (state) => {
      state.currentWorkflow = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Workflows
      .addCase(fetchWorkflows.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkflows.fulfilled, (state, action) => {
        state.loading = false;
        state.workflows = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchWorkflows.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Single Workflow
      .addCase(fetchWorkflow.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkflow.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWorkflow = action.payload;
      })
      .addCase(fetchWorkflow.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Workflow
      .addCase(createWorkflow.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createWorkflow.fulfilled, (state, action) => {
        state.loading = false;
        state.workflows = [action.payload, ...state.workflows];
      })
      .addCase(createWorkflow.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Workflow
      .addCase(updateWorkflow.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateWorkflow.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWorkflow = action.payload;
        state.workflows = state.workflows.map(workflow =>
          workflow.id === action.payload.id ? action.payload : workflow
        );
      })
      .addCase(updateWorkflow.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Approve Workflow Step
      .addCase(approveWorkflowStep.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveWorkflowStep.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWorkflow = action.payload;
        state.workflows = state.workflows.map(workflow =>
          workflow.id === action.payload.id ? action.payload : workflow
        );
      })
      .addCase(approveWorkflowStep.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Reject Workflow Step
      .addCase(rejectWorkflowStep.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectWorkflowStep.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWorkflow = action.payload;
        state.workflows = state.workflows.map(workflow =>
          workflow.id === action.payload.id ? action.payload : workflow
        );
      })
      .addCase(rejectWorkflowStep.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearCurrentWorkflow } = workflowSlice.actions;

export default workflowSlice.reducer;
