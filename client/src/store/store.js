import { configureStore } from '@reduxjs/toolkit';
import userReducer, { setUser, clearUser } from './userSlice';
import API from '../../api/axios';

const store = configureStore({
  reducer: {
    user: userReducer,
  },
});

const logout = async () => {
  try {
    await API.post('/auth/logout');
  } catch (error) {
    console.error('Error during server logout:', error);
  }
  store.dispatch(clearUser());
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('role');
  localStorage.removeItem('team');
  // Redirect to login page
  window.location.href = '/login';
};

const token = localStorage.getItem('token');
console.log("Token from localStorage:", token);
if (token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const userData = JSON.parse(jsonPayload);
    console.log("Decoded userData from token:", userData);

    const teamData = localStorage.getItem('team');
    const team = teamData ? JSON.parse(teamData) : null;
    const storedRole = localStorage.getItem('role');
    store.dispatch(setUser({ user: userData, role: userData.role || storedRole || null, team }));

    // Calculate token expiration time in milliseconds
    const currentTime = Math.floor(Date.now() / 1000);
    const expTime = userData.exp;
    const timeLeft = expTime - currentTime;

    if (timeLeft <= 0) {
      // Token already expired
      logout();
    } else {
      // Set timeout to logout user when token expires
      setTimeout(() => {
        logout();
      }, timeLeft * 1000);
    }
  } catch (error) {
    console.error('Failed to decode token for user initialization', error);
    logout();
  }
}

export default store;
