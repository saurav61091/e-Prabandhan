import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../services/api';

// Async thunks
export const fetchDocuments = createAsyncThunk(
  'document/fetchDocuments',
  async (params, { rejectWithValue }) => {
    try {
      const response = await apiService.getDocuments(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchDocument = createAsyncThunk(
  'document/fetchDocument',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.getDocument(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const uploadDocument = createAsyncThunk(
  'document/upload',
  async ({ data, onProgress }, { rejectWithValue }) => {
    try {
      const response = await apiService.createDocument(data, onProgress);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateDocument = createAsyncThunk(
  'document/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateDocument(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteDocument = createAsyncThunk(
  'document/delete',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.deleteDocument(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const searchDocuments = createAsyncThunk(
  'document/search',
  async (query, { rejectWithValue }) => {
    try {
      const response = await apiService.searchDocuments(query);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  documents: [],
  currentDocument: null,
  searchResults: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },
  loading: false,
  error: null,
  uploadProgress: 0
};

const documentSlice = createSlice({
  name: 'document',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
    clearCurrentDocument: (state) => {
      state.currentDocument = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Documents
      .addCase(fetchDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Single Document
      .addCase(fetchDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDocument = action.payload;
      })
      .addCase(fetchDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Upload Document
      .addCase(uploadDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.uploadProgress = 0;
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = [action.payload, ...state.documents];
        state.uploadProgress = 100;
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.uploadProgress = 0;
      })
      // Update Document
      .addCase(updateDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDocument = action.payload;
        state.documents = state.documents.map(doc =>
          doc.id === action.payload.id ? action.payload : doc
        );
      })
      .addCase(updateDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Document
      .addCase(deleteDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = state.documents.filter(doc => doc.id !== action.payload);
        if (state.currentDocument?.id === action.payload) {
          state.currentDocument = null;
        }
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Search Documents
      .addCase(searchDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, setUploadProgress, clearCurrentDocument } = documentSlice.actions;

export default documentSlice.reducer;
