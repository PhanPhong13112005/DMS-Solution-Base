// src/types.ts
// Định nghĩa các kiểu dữ liệu (interfaces) dùng chung trong toàn bộ ứng dụng

export interface Room {
  id: string;
  roomNumber: string;
  building: string;
  capacity: number;
  available: number;
  size: number;
  price: number;
  gender: string;
  amenities: string[];
  occupants?: string[];
}

export interface BookingApplication {
  id: string;
  fullName: string;
  studentId: string;
  className: string;
  phone: string;
  email: string;
  roomId: string;
  roomNumber: string;
  building: string;
  paymentMethod: 'bank' | 'e-wallet' | 'direct';
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  evidenceCCCD?: string;
  evidenceStudentCard?: string;
}

export interface MaintenanceRequest {
  id: string;
  roomNumber: string;
  title: string;
  description: string;
  category: string;
  priority: 'Critical' | 'Normal';
  status: 'Pending' | 'In Progress' | 'Resolved';
  createdAt: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  category: 'TIN TỨC KTX' | 'SỰ KIỆN' | 'THÔNG BÁO' | 'HOẠT ĐỘNG SV' | 'Quy định - Thủ tục';
  date: string;
  summary: string;
  content: string;
  image: string;
}

export interface Invoice {
  id: string;
  displayId?: string;
  roomNumber: string;
  studentId: string;
  month: string;
  amount: number;
  electricityCost?: number;
  waterCost?: number;
  type: string;
  status: 'Unpaid' | 'Paid';
  createdAt: string;
}

export interface TransferRequest {
  id: string;
  studentId: string;
  fullName: string;
  currentRoom: string;
  requestedRoom: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}
