/**
 * Contract & Student Service API
 * N2 Service - Quản lý đơn đặt phòng, chuyển phòng
 *
 * Endpoints (từ OpenAPI spec N2):
 * - BookingApplications: GET/POST, GET/PUT/{id}
 * - TransferRequests: GET/POST, GET/PUT/{id}
 */

import { apiRequest } from './api.service';
import type { BookingApplication, TransferRequest } from '../types';

// ============ BOOKING APPLICATIONS API ============

export const bookingApplicationsApi = {
  /**
   * GET: Lấy danh sách tất cả đơn đặt phòng
   */
  getAll: () => apiRequest.get<BookingApplication[]>('/StudentContracts'),

  /**
   * GET: Lấy thông tin chi tiết một đơn
   * @param id - Booking Application ID
   */
  getById: (id: string) => apiRequest.get<BookingApplication>(`/StudentContracts/${id}`),

  /**
   * POST: Tạo đơn đặt phòng mới
   * @param data - Booking application data
   */
  create: (data: Omit<BookingApplication, 'id' | 'createdAt'>) =>
    apiRequest.post<BookingApplication>('/StudentContracts', data),

  /**
   * PUT: Cập nhật thông tin đơn
   * @param id - Booking Application ID
   * @param data - Updated data (status, paymentMethod, etc.)
   */
  update: (id: string, data: Partial<BookingApplication>) =>
    apiRequest.put<void>(`/StudentContracts/${id}`, data),

  /**
   * PUT: Phê duyệt đơn đặt phòng
   * @param id - Booking Application ID
   */
  approve: (id: string) =>
    apiRequest.put<void>(`/StudentContracts/${id}/approve`, { status: 'Approved' }),

  /**
   * PUT: Từ chối đơn đặt phòng
   * @param id - Booking Application ID
   */
  reject: (id: string) =>
    apiRequest.put<void>(`/StudentContracts/${id}/reject`, { status: 'Rejected' }),
};

// ============ TRANSFER REQUESTS API ============

export const transferRequestsApi = {
  /**
   * GET: Lấy danh sách tất cả yêu cầu chuyển phòng
   */
  getAll: () => apiRequest.get<TransferRequest[]>('/Transfers'),

  /**
   * GET: Lấy thông tin chi tiết một yêu cầu
   * @param id - Transfer Request ID
   */
  getById: (id: string) => apiRequest.get<TransferRequest>(`/Transfers/${id}`),

  /**
   * POST: Tạo yêu cầu chuyển phòng mới
   * @param data - Transfer request data
   */
  create: (data: Omit<TransferRequest, 'id' | 'createdAt'>) =>
    apiRequest.post<TransferRequest>('/Transfers', data),

  /**
   * PUT: Cập nhật yêu cầu chuyển phòng
   * @param id - Transfer Request ID
   * @param data - Updated data (status, reason, etc.)
   */
  update: (id: string, data: Partial<TransferRequest>) =>
    apiRequest.put<void>(`/Transfers/${id}`, data),

  /**
   * PUT: Phê duyệt yêu cầu chuyển phòng
   * @param id - Transfer Request ID
   */
  approve: (id: string) =>
    apiRequest.put<void>(`/Transfers/${id}/approve`, { status: 'Approved' }),

  /**
   * PUT: Từ chối yêu cầu chuyển phòng
   * @param id - Transfer Request ID
   */
  reject: (id: string) =>
    apiRequest.put<void>(`/Transfers/${id}/reject`, { status: 'Rejected' }),
};

// ============ EXPORT GROUPED API ============
export const contractApi = {
  applications: bookingApplicationsApi,
  transfers: transferRequestsApi,
};

export default contractApi;
