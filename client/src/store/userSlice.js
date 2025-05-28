import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null, // user object or null if not logged in
  role: null, // 'user', 'team_owner', 'admin' or null
  team: null, // team object or null if not available
  initialized: false, // indicates if user state is loaded
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload.user;
      state.role = action.payload.role;
      state.team = action.payload.team || null;
      state.initialized = true;
    },
    clearUser(state) {
      state.user = null;
      state.role = null;
      state.team = null;
      state.initialized = true;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;

export default userSlice.reducer;
