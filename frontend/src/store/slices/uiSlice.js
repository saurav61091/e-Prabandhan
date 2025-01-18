import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarOpen: true,
  theme: localStorage.getItem('theme') || 'light',
  notifications: [],
  modals: {
    documentUpload: false,
    documentPreview: false,
    workflowCreate: false,
    departmentMerge: false,
    confirmDelete: false
  },
  selectedItems: [],
  filters: {
    documents: {},
    workflows: {},
    departments: {}
  },
  sort: {
    documents: { field: 'createdAt', order: 'desc' },
    workflows: { field: 'createdAt', order: 'desc' },
    departments: { field: 'name', order: 'asc' }
  }
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        ...action.payload
      });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    toggleModal: (state, action) => {
      state.modals[action.payload] = !state.modals[action.payload];
    },
    setModalState: (state, action) => {
      const { modal, isOpen } = action.payload;
      state.modals[modal] = isOpen;
    },
    setSelectedItems: (state, action) => {
      state.selectedItems = action.payload;
    },
    clearSelectedItems: (state) => {
      state.selectedItems = [];
    },
    setFilters: (state, action) => {
      const { type, filters } = action.payload;
      state.filters[type] = filters;
    },
    clearFilters: (state, action) => {
      state.filters[action.payload] = {};
    },
    setSort: (state, action) => {
      const { type, field, order } = action.payload;
      state.sort[type] = { field, order };
    }
  }
});

export const {
  toggleSidebar,
  setTheme,
  addNotification,
  removeNotification,
  clearNotifications,
  toggleModal,
  setModalState,
  setSelectedItems,
  clearSelectedItems,
  setFilters,
  clearFilters,
  setSort
} = uiSlice.actions;

export default uiSlice.reducer;
