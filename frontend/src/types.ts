/**
 * User account (from OpenAPI Auth endpoints)
 * Field mapping: id (MSSV/Admin ID), name (Họ tên), role ('Student'|'Admin'|'Staff')
 */
export interface User {
  id: string; // MSSV or Admin ID
  name: string; // Full name
  role?: 'Guest' | 'Student' | 'Staff' | 'Admin';
  email?: string; // Email address
  phone?: string; // Phone number
  className?: string; // Class name (for students)
  roomNumber?: string; // Current room assignment
}

/**
 * Building model from Room Building Service
 * Field mapping: id (UUID), name (Tên tòa), totalFloors (Số tầng)
 */
export interface Building {
  id: number;
  name: string; // Tòa A, Tòa B, Tòa C
  totalFloors: number;
  genderRestriction?: string; // Nam/Nữ/Không
  rooms?: Room[];
}

/**
 * Room model from Room Building Service
 * Field mapping: id, roomNumber (Số phòng), buildingId, monthlyPrice, status
 */
export interface Room {
  id: number;
  buildingId: number;
  roomNumber: string;
  floorNumber: number;
  roomType?: string; // Standard, VIP, etc.
  monthlyPrice: number; // VNĐ / tháng
  status?: string; // Available, Occupied, Maintenance
  amenities?: RoomAmenity[];
  beds?: Bed[];
}

/**
 * Bed model from Room Building Service
 * Field mapping: id, roomId, bedName, isAvailable, assignedStudentId
 */
export interface Bed {
  id: number;
  roomId: number;
  bedName: string; // Giường A, Giường B, etc.
  isAvailable: boolean;
  assignedStudentId?: string | null; // MSSV nếu có người ở
}

/**
 * RoomAmenity model from Room Building Service
 * Field mapping: id, roomId, amenityName (tên tiện nghi), condition (tình trạng)
 */
export interface RoomAmenity {
  id: number;
  roomId: number;
  amenityName: string; // WC riêng, Máy lạnh, Bàn học, etc.
  condition: string; // Good, Fair, Poor
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
  evidenceCCCD: string;
  evidenceStudentCard: string;
}

export interface MaintenanceRequest {
  id: string;
  roomNumber: string;
  title: string;
  description: string;
  category: string; // Điện, Nước, Thiết bị, Khác
  priority: 'Critical' | 'Normal';
  status: 'Pending' | 'In Progress' | 'Resolved';
  createdAt: string;
  feedback?: string;
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

export interface Invoice {
  id: string;
  roomNumber: string;
  studentId: string;
  month: string;
  amount: number;
  type: 'Tiền phòng' | 'Điện nước' | 'Phí dịch vụ';
  status: 'Paid' | 'Unpaid';
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

export enum UserRole {
  Guest = 'Guest',
  Student = 'Student',
  Staff = 'Staff',
  Admin = 'Admin'
}

export enum AppScreen {
  Home = 'Home',
  About = 'About',
  Booking = 'Booking',
  News = 'News',
  Rules = 'Rules',
  Contact = 'Contact',
  Auth = 'Auth',
  StudentPortal = 'StudentPortal',
  StaffPortal = 'StaffPortal',
  AdminPortal = 'AdminPortal'
}
