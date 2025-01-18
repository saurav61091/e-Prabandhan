import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchWorkflowTemplates = createAsyncThunk('workflowTemplates/fetchWorkflowTemplates', async () => {
  const response = await axios.get('/api/workflow-templates');
  return response.data;
});

const initialState = {
  workflowTemplates: [],
  loading: false,
  error: null,
};

const workflowTemplateSlice = createSlice({
  name: 'workflowTemplates',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkflowTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkflowTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.workflowTemplates = action.payload;
      })
      .addCase(fetchWorkflowTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default workflowTemplateSlice.reducer;
