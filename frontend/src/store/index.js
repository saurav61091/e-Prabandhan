import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import documentReducer from './slices/documentSlice';
import workflowReducer from './slices/workflowSlice';
import departmentReducer from './slices/departmentSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
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
        // Ignore these action types
        ignoredActions: ['auth/login/fulfilled', 'document/upload/fulfilled'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.file', 'meta.arg.file'],
        // Ignore these paths in the state
        ignoredPaths: ['document.currentFile']
      }
    })
});

// Helper hooks for accessing the store
export const getState = store.getState;
export const dispatch = store.dispatch;
