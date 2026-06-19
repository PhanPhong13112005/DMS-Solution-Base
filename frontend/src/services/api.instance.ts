import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api', // Đi qua Ocelot Gateway
  headers: { 'Content-Type': 'application/json' }
});

// Tự động gắn JWT Token từ localStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor xử lý lỗi tập trung
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jwt_token');
      window.location.href = '/auth'; // Đá về trang login nếu hết hạn token
    }
    return Promise.reject(error);
  }
);

export default apiClient;