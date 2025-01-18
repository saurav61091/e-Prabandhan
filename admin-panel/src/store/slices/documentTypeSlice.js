import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchDocumentTypes = createAsyncThunk('documentTypes/fetchDocumentTypes', async () => {
  const response = await axios.get('/api/document-types');
  return response.data;
});

const initialState = {
  documentTypes: [],
  loading: false,
  error: null,
};

const documentTypeSlice = createSlice({
  name: 'documentTypes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocumentTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocumentTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.documentTypes = action.payload;
      })
      .addCase(fetchDocumentTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default documentTypeSlice.reducer;
