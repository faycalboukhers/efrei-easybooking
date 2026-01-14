import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const signup = (userData) => api.post('/auth/signup', userData);
export const login = (credentials) => api.post('/auth/login', credentials);

// Room APIs
export const getRooms = (filters = {}) => api.get('/rooms', { params: filters });
export const getRoomById = (id) => api.get(`/rooms/${id}`);
export const checkAvailability = (roomId, data) => api.post(`/rooms/${roomId}/check-availability`, data);

// Booking APIs
export const createBooking = (bookingData) => api.post('/bookings', bookingData);
export const getMyBookings = () => api.get('/bookings/my-bookings');
export const getAllBookings = () => api.get('/bookings');
export const cancelBooking = (id) => api.delete(`/bookings/${id}`);

export default api;