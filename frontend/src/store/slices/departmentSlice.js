import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../services/api';

// Async thunks
export const fetchDepartments = createAsyncThunk(
  'department/fetchDepartments',
  async (params, { rejectWithValue }) => {
    try {
      const response = await apiService.getDepartments(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchDepartment = createAsyncThunk(
  'department/fetchDepartment',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.getDepartment(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createDepartment = createAsyncThunk(
  'department/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiService.createDepartment(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateDepartment = createAsyncThunk(
  'department/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateDepartment(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const mergeDepartments = createAsyncThunk(
  'department/merge',
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiService.mergeDepartments(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchDepartmentHierarchy = createAsyncThunk(
  'department/fetchHierarchy',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getDepartmentHierarchy();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  departments: [],
  currentDepartment: null,
  hierarchy: null,
  loading: false,
  error: null
};

const departmentSlice = createSlice({
  name: 'department',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentDepartment: (state) => {
      state.currentDepartment = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Departments
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading = false;
        state.departments = action.payload;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Single Department
      .addCase(fetchDepartment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepartment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDepartment = action.payload;
      })
      .addCase(fetchDepartment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Department
      .addCase(createDepartment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.loading = false;
        state.departments = [...state.departments, action.payload];
      })
      .addCase(createDepartment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Department
      .addCase(updateDepartment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDepartment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDepartment = action.payload;
        state.departments = state.departments.map(dept =>
          dept.id === action.payload.id ? action.payload : dept
        );
      })
      .addCase(updateDepartment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Merge Departments
      .addCase(mergeDepartments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(mergeDepartments.fulfilled, (state, action) => {
        state.loading = false;
        state.departments = state.departments.filter(
          dept => !action.payload.mergedDepartments.includes(dept.id)
        );
        const updatedDept = state.departments.find(
          dept => dept.id === action.payload.targetDepartment
        );
        if (updatedDept) {
          state.departments = state.departments.map(dept =>
            dept.id === updatedDept.id ? action.payload.targetDepartment : dept
          );
        }
      })
      .addCase(mergeDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Department Hierarchy
      .addCase(fetchDepartmentHierarchy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepartmentHierarchy.fulfilled, (state, action) => {
        state.loading = false;
        state.hierarchy = action.payload;
      })
      .addCase(fetchDepartmentHierarchy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearCurrentDepartment } = departmentSlice.actions;

export default departmentSlice.reducer;
