import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';

/**
 * API Service - Centralized Axios client with JWT auth & error handling
 * Features:
 * - Auto JWT token injection in Authorization header
 * - Custom error interceptor (401/403/500 handling)
 * - Request/Response type safety
 */

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://143.198.83.224:5000/api';
const tokenKey = import.meta.env.VITE_JWT_TOKEN_KEY || 'auth_token';
const storageType = import.meta.env.VITE_JWT_STORAGE_TYPE || 'localStorage';

// Determine storage mechanism
const getStorage = () => {
  return storageType === 'sessionStorage' ? sessionStorage : localStorage;
};

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor: Auto inject JWT token
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = getStorage().getItem(tokenKey);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor: Custom error handling
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    const status = error.response?.status;
    const message = (error.response?.data as any)?.message || error.message;

    switch (status) {
      case 401:
        // Unauthorized - redirect to login
        console.error('❌ Unauthorized (401): Redirecting to login...');
        getStorage().removeItem(tokenKey);
        // TODO: Navigate to login page
        // router.push('/auth');
        break;

      case 403:
        // Forbidden - no permission
        console.error('❌ Forbidden (403): Bạn không có quyền truy cập resource này');
        break;

      case 500:
        // Server error
        console.error('❌ Server Error (500): Máy chủ đang gặp sự cố');
        break;

      default:
        console.error(`❌ Error (${status}): ${message}`);
    }

    return Promise.reject(error);
  }
);

/**
 * Generic API Request Methods
 */
export const apiRequest = {
  /**
   * GET request
   * @example apiRequest.get<Room[]>('/rooms')
   */
  get: <T = any>(url: string, config?: any) =>
    apiClient.get<T>(url, config).then((res) => res.data),

  /**
   * POST request
   * @example apiRequest.post<Room>('/rooms', { data: newRoom })
   */
  post: <T = any>(url: string, data?: any, config?: any) =>
    apiClient.post<T>(url, data, config).then((res) => res.data),

  /**
   * PUT request
   * @example apiRequest.put<void>('/rooms/1', { data: updatedRoom })
   */
  put: <T = any>(url: string, data?: any, config?: any) =>
    apiClient.put<T>(url, data, config).then((res) => res.data),

  /**
   * PATCH request
   */
  patch: <T = any>(url: string, data?: any, config?: any) =>
    apiClient.patch<T>(url, data, config).then((res) => res.data),

  /**
   * DELETE request
   * @example apiRequest.delete<void>('/rooms/1')
   */
  delete: <T = any>(url: string, config?: any) =>
    apiClient.delete<T>(url, config).then((res) => res.data),
};

/**
 * News API - Quản lý tin tức, thông báo
 */
export const newsApi = {
  /**
   * GET: Lấy danh sách tất cả tin tức
   */
  getAll: () => apiRequest.get<any[]>('/News'),

  /**
   * GET: Lấy thông tin chi tiết một bài viết
   * @param id - News Article ID
   */
  getById: (id: string) => apiRequest.get<any>(`/News/${id}`),

  /**
   * GET: Lấy tin tức theo danh mục
   * @param category - Category (TIN TỨC KTX, SỰ KIỆN, THÔNG BÁO, etc.)
   */
  getByCategory: (category: string) =>
    apiRequest.get<any[]>('/News', { params: { category } }),

  /**
   * POST: Tạo bài viết mới
   * @param data - News article data
   */
  create: (data: any) => apiRequest.post<any>('/News', data),

  /**
   * PUT: Cập nhật bài viết
   * @param id - News Article ID
   * @param data - Updated article data
   */
  update: (id: string, data: Partial<any>) =>
    apiRequest.put<void>(`/News/${id}`, data),

  /**
   * DELETE: Xóa bài viết
   * @param id - News Article ID
   */
  delete: (id: string) => apiRequest.delete<void>(`/News/${id}`),
};

export default apiClient;
