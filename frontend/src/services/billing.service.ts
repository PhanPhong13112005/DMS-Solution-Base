/**
 * Billing & Maintenance Service API
 * N3 Service - Quản lý hóa đơn, yêu cầu bảo trì
 *
 * Endpoints (từ OpenAPI spec N3):
 * - Invoices: GET/POST, GET/PUT/{id}
 * - MaintenanceRequests: GET/POST, GET/PUT/{id}
 */

import { apiRequest } from './api.service';
import type { Invoice, MaintenanceRequest } from '../types';

// ============ INVOICES API ============

export const invoicesApi = {
  /**
   * GET: Lấy danh sách tất cả hóa đơn
   */
  getAll: () => apiRequest.get<Invoice[]>('/Invoices'),

  /**
   * GET: Lấy thông tin chi tiết một hóa đơn
   * @param id - Invoice ID
   */
  getById: (id: string) => apiRequest.get<Invoice>(`/Invoices/${id}`),

  /**
   * GET: Lấy danh sách hóa đơn của sinh viên
   * @param studentId - Student ID (MSSV)
   */
  getByStudent: (studentId: string) =>
    apiRequest.get<Invoice[]>(`/Invoices/student/${studentId}`),

  /**
   * POST: Tạo hóa đơn mới
   * @param data - Invoice data
   */
  create: (data: Omit<Invoice, 'id' | 'createdAt'>) =>
    apiRequest.post<Invoice>('/Invoices', data),

  /**
   * PUT: Cập nhật hóa đơn
   * @param id - Invoice ID
   * @param data - Updated invoice data
   */
  update: (id: string, data: Partial<Invoice>) =>
    apiRequest.put<void>(`/Invoices/${id}`, data),

  /**
   * PUT: Đánh dấu hóa đơn là đã thanh toán
   * @param id - Invoice ID
   */
  markAsPaid: (id: string) =>
    apiRequest.put<void>(`/Invoices/${id}`, { status: 'Paid' }),

  /**
   * DELETE: Xóa hóa đơn
   * @param id - Invoice ID
   */
  delete: (id: string) => apiRequest.delete<void>(`/Invoices/${id}`),
};

// ============ MAINTENANCE REQUESTS API ============

export const maintenanceRequestsApi = {
  /**
   * GET: Lấy danh sách tất cả yêu cầu bảo trì
   */
  getAll: () => apiRequest.get<MaintenanceRequest[]>('/MaintenanceRequests'),

  /**
   * GET: Lấy thông tin chi tiết một yêu cầu
   * @param id - Maintenance Request ID
   */
  getById: (id: string) => apiRequest.get<MaintenanceRequest>(`/MaintenanceRequests/${id}`),

  /**
   * GET: Lấy danh sách yêu cầu bảo trì của một phòng
   * @param roomNumber - Room number
   */
  getByRoom: (roomNumber: string) =>
    apiRequest.get<MaintenanceRequest[]>(`/MaintenanceRequests/room/${roomNumber}`),

  /**
   * POST: Tạo yêu cầu bảo trì mới
   * @param data - Maintenance request data
   */
  create: (data: Omit<MaintenanceRequest, 'id' | 'createdAt'>) =>
    apiRequest.post<MaintenanceRequest>('/MaintenanceRequests', data),

  /**
   * PUT: Cập nhật yêu cầu bảo trì
   * @param id - Maintenance Request ID
   * @param data - Updated data (status, feedback, etc.)
   */
  update: (id: string, data: Partial<MaintenanceRequest>) =>
    apiRequest.put<void>(`/MaintenanceRequests/${id}`, data),

  /**
   * PUT: Cập nhật trạng thái yêu cầu bảo trì
   * @param id - Maintenance Request ID
   * @param status - New status (Pending, In Progress, Resolved)
   */
  updateStatus: (id: string, status: 'Pending' | 'In Progress' | 'Resolved') =>
    apiRequest.put<void>(`/MaintenanceRequests/${id}`, { status }),

  /**
   * DELETE: Xóa yêu cầu bảo trì
   * @param id - Maintenance Request ID
   */
  delete: (id: string) => apiRequest.delete<void>(`/MaintenanceRequests/${id}`),
};

// ============ EXPORT GROUPED API ============
export const billingApi = {
  invoices: invoicesApi,
  maintenance: maintenanceRequestsApi,
};

export default billingApi;
