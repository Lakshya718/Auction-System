import axios from 'axios';

const API = axios.create({
  baseURL: 'http://auction-system-deploy.onrender.com/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default API;
