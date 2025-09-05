import axios from 'axios';
const devURL = 'http://localhost:5000/api';
const prodURL = 'https://auction-system-deploy.onrender.com/api';

const API = axios.create({
  baseURL: prodURL || devURL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default API;
