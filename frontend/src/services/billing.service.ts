/**
 * Billing & Maintenance Service API - Nhóm 3
 * Backend N3 chạy tại: http://localhost:8082/api/v1
 *
 * Endpoints thực tế (khớp với BillsController & MaintenanceController):
 * - Bills:       GET/POST /bills, GET/PUT/{id}, PUT/{id}/pay, DELETE/{id}
 *                GET /bills/unpaid, /bills/stats, /bills/student/{id}
 *                GET /bills/type/{type}, /bills/due-soon?days=N  [MỚI]
 *                POST /bills/extra-fee                            [MỚI]
 * - Maintenance: GET/POST /maintenance, GET/PUT/{id}/status, DELETE/{id}
 *                GET /maintenance/pending, /maintenance/room/{id}
 *                GET /maintenance/category/{cat}, /maintenance/student/{id} [MỚI]
 *                GET /maintenance/stats                                      [MỚI]
 */

import apiClient from '../api/axios'; // axios instance trỏ đúng port 8082
import type { Invoice, MaintenanceRequest } from '../types';

// ============================================================
// HELPERS
// ============================================================

/** Trích dữ liệu thực từ response wrapper { IsSuccess, Data } của backend N3 */
const extractData = <T>(res: any): T => res.data?.Data ?? res.data?.data ?? res.data;

/** Map backend Bill model to frontend Invoice interface */
const mapInvoice = (b: any): Invoice => ({
  ...b,
  id: b.id,
  type: b.billType === 'MONTHLY' ? 'MONTHLY' : 'EXTRA_FEE',
  title: b.title || (b.billType === 'MONTHLY' ? 'Hóa đơn tháng' : 'Hóa đơn phát sinh'),
  amount: b.totalAmount || b.extraAmount || 0,
  status: b.isPaid ? 'Paid' : (b.receiptCode === 'PENDING_VERIFICATION' ? 'Pending' : 'Unpaid'),
  month: b.targetMonth || 'N/A',
  roomNumber: b.roomId, // Add roomNumber directly from roomId
  roomFee: b.roomFee || 0,
  electricityFee: b.electricityCost || 0,
  waterFee: b.waterCost || 0,
  serviceFee: b.serviceFee || 0,
  reason: b.feeReason || '',
  description: b.description || b.title || '',
});

// ============================================================
// INVOICES API (/api/v1/bills)
// ============================================================

export const invoicesApi = {
  /** GET /bills — Lấy tất cả hóa đơn */
  getAll: () =>
    apiClient.get('/bills').then(res => extractData<any[]>(res).map(mapInvoice)),

  /** GET /bills/{id} — Lấy hóa đơn theo ID */
  getById: (id: string) =>
    apiClient.get(`/bills/${id}`).then(res => mapInvoice(extractData<any>(res))),

  /** GET /bills/room/{roomId} — Lấy hóa đơn theo phòng */
  getByRoom: (roomId: number) =>
    apiClient.get(`/bills/room/${roomId}`).then(res => extractData<any[]>(res).map(mapInvoice)),

  /** GET /bills/student/{studentId} — Lấy hóa đơn của sinh viên */
  getByStudent: (studentId: string | number) =>
    apiClient.get(`/bills/student/${studentId}`).then(res => extractData<any[]>(res).map(mapInvoice)),

  /** GET /bills/unpaid — Lấy tất cả hóa đơn chưa thanh toán */
  getUnpaid: () =>
    apiClient.get('/bills/unpaid').then(res => extractData<any[]>(res).map(mapInvoice)),

  /** GET /bills/stats — Thống kê doanh thu tổng hợp */
  getStats: () =>
    apiClient.get('/bills/stats').then(extractData<any>),

  /** GET /bills/type/{type} — Lọc theo loại: MONTHLY hoặc EXTRA_FEE */
  getByType: (type: 'MONTHLY' | 'EXTRA_FEE') =>
    apiClient.get(`/bills/type/${type}`).then(res => extractData<any[]>(res).map(mapInvoice)),

  /** GET /bills/due-soon?days=N — Lấy hóa đơn sắp tới hạn (trong N ngày) */
  getDueSoon: (days = 3) =>
    apiClient.get(`/bills/due-soon?days=${days}`).then(res => extractData<any[]>(res).map(mapInvoice)),

  /** POST /bills — Tạo hóa đơn tháng mới (MONTHLY) */
  create: (data: any) => {
    const payload = {
      roomId: parseInt(data.roomNumber as string) || 0,
      studentId: parseInt(data.studentId as string) || 0,
      targetMonth: data.month,
      billType: 'MONTHLY',
      electricityCost: data.electricityFee || data.electricityCost || 0,
      waterCost: data.waterFee || data.waterCost || 0,
      serviceFee: data.serviceFee || 0,
      title: data.title || 'Hóa đơn tháng ' + data.month
    };
    return apiClient.post('/bills', payload).then(res => mapInvoice(extractData<any>(res)));
  },

  /** POST /bills/extra-fee — Tạo hóa đơn phát sinh lẻ (phạt, đền bù...) */
  createExtraFee: (data: {
    roomId: number;
    studentId: number;
    reason: string;
    description: string;
    amount: number;
  }) =>
    apiClient.post('/bills/extra-fee', data).then(res => mapInvoice(extractData<any>(res))),

  /** PUT /bills/{id}/student-pay — Học sinh xác nhận thanh toán (chờ staff duyệt) */
  studentPay: (id: string) =>
    apiClient.put(`/bills/${id}/student-pay`).then(res => mapInvoice(extractData<any>(res))),

  /** PUT /bills/{id}/pay — Thanh toán hóa đơn (sinh mã biên lai tự động) */
  markAsPaid: (id: string, method?: string) =>
    apiClient.put(`/bills/${id}/pay`, { method }).then(res => mapInvoice(extractData<any>(res))),

  /** DELETE /bills/{id} — Xóa hóa đơn */
  delete: (id: string) =>
    apiClient.delete(`/bills/${id}`).then(extractData<void>),
};

// ============================================================
// MAINTENANCE API (/api/v1/maintenance)
// ============================================================

export const maintenanceApi = {
  /** GET /maintenance — Lấy tất cả yêu cầu bảo trì */
  getAll: () =>
    apiClient.get('/maintenance').then(extractData<MaintenanceRequest[]>),

  /** GET /maintenance/{id} — Lấy yêu cầu theo ID */
  getById: (id: string) =>
    apiClient.get(`/maintenance/${id}`).then(extractData<MaintenanceRequest>),

  /** GET /maintenance/room/{roomId} — Lấy yêu cầu theo phòng */
  getByRoom: (roomId: number) =>
    apiClient.get(`/maintenance/room/${roomId}`).then(extractData<MaintenanceRequest[]>),

  /** GET /maintenance/pending — Lấy các phiếu đang chờ xử lý */
  getPending: () =>
    apiClient.get('/maintenance/pending').then(extractData<MaintenanceRequest[]>),

  /** GET /maintenance/category/{cat} — Lọc theo danh mục: Điện, Nước, Thiết bị, Khác */
  getByCategory: (category: string) =>
    apiClient.get(`/maintenance/category/${encodeURIComponent(category)}`).then(extractData<MaintenanceRequest[]>),

  /** GET /maintenance/student/{studentId} — Lấy phiếu của sinh viên cụ thể */
  getByStudent: (studentId: string | number) =>
    apiClient.get(`/maintenance/student/${studentId}`).then(extractData<MaintenanceRequest[]>),

  /** GET /maintenance/stats — Thống kê hiệu suất bộ phận kỹ thuật (dành cho Admin) */
  getStats: () =>
    apiClient.get('/maintenance/stats').then(extractData<{
      totalRequests: number;
      pendingCount: number;
      processingCount: number;
      completedCount: number;
      criticalCount: number;
      resolutionRate: number;
      avgResolutionHours: number;
      byCategory: { category: string; count: number }[];
    }>),

  /** POST /maintenance — Tạo yêu cầu bảo trì mới */
  create: (data: Omit<MaintenanceRequest, 'id' | 'createdAt'>) =>
    apiClient.post('/maintenance', data).then(extractData<MaintenanceRequest>),

  /** POST /maintenance/with-image — Tạo báo hỏng đính kèm ảnh */
  createWithImage: (formData: FormData) =>
    apiClient.post('/maintenance/with-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(extractData<MaintenanceRequest>),

  /** PUT /maintenance/{id}/status — Cập nhật trạng thái phiếu */
  updateStatus: (id: string, status: string) =>
    apiClient.put(`/maintenance/${id}/status`, { status }).then(extractData<MaintenanceRequest>),

  /** DELETE /maintenance/{id} — Xóa yêu cầu bảo trì */
  delete: (id: string) =>
    apiClient.delete(`/maintenance/${id}`).then(extractData<void>),
};

// ============================================================
// UTILITIES API (/api/v1/utilities)
// ============================================================

export const utilitiesApi = {
  /** POST /utilities/record — Ghi nhận chỉ số điện nước */
  record: (data: { roomId: string | number; electricityIndex: number; waterIndex: number; recordedDate?: string }) =>
    apiClient.post('/utilities/record', data).then(extractData<any>),
    
  /** GET /utilities/current-month — Lấy tất cả chỉ số điện nước của tháng hiện tại */
  getCurrentMonth: () =>
    apiClient.get('/utilities/current-month').then(extractData<any[]>),
};

// ============================================================
// EXPORT GROUPED API
// ============================================================
export const billingApi = {
  invoices: invoicesApi,
  maintenance: maintenanceApi,
  utilities: utilitiesApi,
};

export default billingApi;
