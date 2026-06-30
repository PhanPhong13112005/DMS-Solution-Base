import axios from 'axios';

// Backend Nhóm 3 chạy ở cổng 8082
const apiClient = axios.create({
  baseURL: 'http://localhost:8082/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor tự động gắn JWT Token vào mọi Request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Bắt lỗi tự động văng ra ngoài Login nếu Token hết hạn (401)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Nếu là lỗi 401 nhưng là từ API đăng nhập thì không ép tải lại trang
    if (error.response && error.response.status === 401 && !error.config.url?.includes('/auth/login')) {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('current_user');
      // Không dùng window.location.href để tránh vòng lặp vô tận (infinite reload loop)
    }
    return Promise.reject(error);
  }
);

export default apiClient;
