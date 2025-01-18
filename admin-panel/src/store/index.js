import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './slices/themeSlice';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import departmentReducer from './slices/departmentSlice';
import roleReducer from './slices/roleSlice';
import documentTypeReducer from './slices/documentTypeSlice';
import workflowTemplateReducer from './slices/workflowTemplateSlice';
import settingsReducer from './slices/settingsSlice';

const store = configureStore({
  reducer: {
    theme: themeReducer,
    auth: authReducer,
    user: userReducer,
    department: departmentReducer,
    role: roleReducer,
    documentType: documentTypeReducer,
    workflowTemplate: workflowTemplateReducer,
    settings: settingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
