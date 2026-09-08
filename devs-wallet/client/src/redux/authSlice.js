import { createSlice } from '@reduxjs/toolkit';

const storedUser = localStorage.getItem('devswallet_user');

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: localStorage.getItem('devswallet_token') || null,
  wallet: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      localStorage.setItem('devswallet_token', token);
      localStorage.setItem('devswallet_user', JSON.stringify(user));
    },
    setWallet: (state, action) => {
      state.wallet = action.payload;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('devswallet_user', JSON.stringify(state.user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.wallet = null;
      localStorage.removeItem('devswallet_token');
      localStorage.removeItem('devswallet_user');
    },
  },
});

export const { setCredentials, setWallet, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;
