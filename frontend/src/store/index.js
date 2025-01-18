import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import documentReducer from './slices/documentSlice';
import workflowReducer from './slices/workflowSlice';
import departmentReducer from './slices/departmentSlice';
import uiReducer from './slices/uiSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    document: documentReducer,
    workflow: workflowReducer,
    department: departmentReducer,
    ui: uiReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/login/fulfilled', 'document/upload/fulfilled'],
        ignoredActionPaths: ['payload.file', 'meta.arg.file'],
        ignoredPaths: ['document.currentFile']
      }
    })
});

// Helper hooks for accessing the store
export const getState = store.getState;
export const dispatch = store.dispatch;

export default store;
