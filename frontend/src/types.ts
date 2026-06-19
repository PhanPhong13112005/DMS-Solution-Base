export interface Room {
  id: string;
  roomNumber: string;
  building: string; // Tòa A, Tòa B, Tòa C
  capacity: number; // 2, 4, 6
  size: number; // m²
  price: number; // VNĐ / tháng
  amenities: string[]; // "WC riêng", "Máy lạnh", etc.
  available: number; // slots left
  gender: 'Nam' | 'Nữ';
  occupants: string[]; // Student IDs
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
