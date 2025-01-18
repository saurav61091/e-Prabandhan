import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  mode: localStorage.getItem('themeMode') || 'light',
  primaryColor: localStorage.getItem('primaryColor') || '#1976d2',
  secondaryColor: localStorage.getItem('secondaryColor') || '#dc004e',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', state.mode);
    },
    setPrimaryColor: (state, action) => {
      state.primaryColor = action.payload;
      localStorage.setItem('primaryColor', action.payload);
    },
    setSecondaryColor: (state, action) => {
      state.secondaryColor = action.payload;
      localStorage.setItem('secondaryColor', action.payload);
    },
  },
});

export const { toggleTheme, setPrimaryColor, setSecondaryColor } = themeSlice.actions;

export default themeSlice.reducer;
