import { Room, BookingApplication, MaintenanceRequest, NewsArticle, Invoice, TransferRequest } from '../types';

export const INITIAL_ROOMS: Room[] = [
  {
    id: 'room-1',
    roomNumber: '101',
    building: 'Tòa B',
    capacity: 2,
    size: 23,
    price: 1200000,
    amenities: ['WC riêng', 'Máy lạnh'],
    available: 1, // Pre-occupied by Nguyễn Hữu Hưng (so 1 available, capacity 2)
    gender: 'Nam',
    occupants: ['1771020536']
  },
  {
    id: 'room-2',
    roomNumber: 'A102',
    building: 'Tòa A',
    capacity: 2,
    size: 20,
    price: 1200000,
    amenities: ['Máy lạnh'],
    available: 1,
    gender: 'Nam',
    occupants: []
  },
  {
    id: 'room-3',
    roomNumber: 'B103',
    building: 'Tòa B',
    capacity: 2,
    size: 21,
    price: 1200000,
    amenities: ['WC riêng'],
    available: 1,
    gender: 'Nam',
    occupants: []
  },
  {
    id: 'room-4',
    roomNumber: 'A104',
    building: 'Tòa A',
    capacity: 2,
    size: 22,
    price: 1200000,
    amenities: ['WC riêng', 'Máy lạnh'],
    available: 0,
    gender: 'Nam',
    occupants: ['SV001', 'SV002']
  },
  {
    id: 'room-5',
    roomNumber: 'C105',
    building: 'Tòa C',
    capacity: 4,
    size: 42,
    price: 800000,
    amenities: ['WC riêng'],
    available: 0,
    gender: 'Nữ',
    occupants: ['SV003', 'SV004', 'SV005', 'SV006']
  },
  {
    id: 'room-6',
    roomNumber: 'A106',
    building: 'Tòa A',
    capacity: 2,
    size: 23,
    price: 1200000,
    amenities: [],
    available: 1,
    gender: 'Nam',
    occupants: ['SV007']
  },
  {
    id: 'room-7',
    roomNumber: 'C107',
    building: 'Tòa C',
    capacity: 4,
    size: 44,
    price: 800000,
    amenities: ['WC riêng', 'Máy lạnh'],
    available: 3,
    gender: 'Nữ',
    occupants: ['SV008']
  },
  {
    id: 'room-8',
    roomNumber: 'A108',
    building: 'Tòa A',
    capacity: 6,
    size: 63,
    price: 500000,
    amenities: ['WC riêng'],
    available: 3,
    gender: 'Nam',
    occupants: ['SV009', 'SV010', 'SV011']
  },
  {
    id: 'room-9',
    roomNumber: 'B101',
    building: 'Tòa B',
    capacity: 6,
    size: 63,
    price: 500000,
    amenities: ['WC riêng', 'Máy lạnh'],
    available: 3,
    gender: 'Nam',
    occupants: ['SV012', 'SV013', 'SV014']
  }
];

export const INITIAL_NEWS: NewsArticle[] = [
  {
    id: 'news-1',
    title: 'Thông báo về việc đăng ký lưu trú học kỳ 1 năm học 2024-2025',
    category: 'TIN TỨC KTX',
    date: '15/10/2024',
    summary: 'Ban Quản lý Ký túc xá thông báo đến toàn thể sinh viên về kế hoạch và thời gian đăng ký lưu trú học kỳ 1 năm học sắp tới.',
    content: 'Để chuẩn bị tốt nhất cho năm học mới, Ban Quản lý Ký túc xá Đại học Đại Nam mở cổng đăng ký lưu trú đợt 1 dành cho tất cả sinh viên từ ngày 15/10/2024 đến hết ngày 30/10/2024. Sinh viên cần chuẩn bị đầy đủ các giấy tờ minh chứng ưu tiên và thẻ sinh viên/mã sinh viên để quá trình duyệt hồ sơ được tiến hành nhanh chóng.',
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'news-2',
    title: 'Chương trình chào đón tân sinh viên khóa K65 tại Ký túc xá',
    category: 'SỰ KIỆN',
    date: '12/10/2024',
    summary: 'Hòa chung không khí tựu trường, BQL KTX tổ chức chương trình giao lưu văn nghệ chào đón các bạn tân sinh viên khóa mới.',
    content: 'Được sự chỉ đạo của Ban Giám hiệu, Ban Quản lý KTX phối hợp cùng Đoàn Thanh niên tổ chức Đêm hội Chào tân sinh viên khóa K65 nội trú. Chương trình có sự góp mặt của nhiều câu lạc bộ nghệ thuật nổi bật, các tiết mục xiếc đặc sắc, bốc thăm trúng thưởng nhiều phần quà hấp dẫn và kết thúc bằng màn lửa trại đầy ý nghĩa.',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'news-3',
    title: 'Kế hoạch bảo trì hệ thống điện nước toàn Ký túc xá tháng 10',
    category: 'THÔNG BÁO',
    date: '05/10/2024',
    summary: 'Để đảm bảo an toàn và nâng cao chất lượng dịch vụ, BQL sẽ tiến hành bảo trì hệ thống điện nước từ ngày 08/10 đến 10/10.',
    content: 'BQL KTX thông báo tiến hành bảo dưỡng định kỳ trạm biến áp và hệ thống lọc nước tổng của cả 3 nhà A, B, C. Lịch cắt điện nước luân phiên sẽ diễn ra trong khoảng từ 08:00 đến 11:30 các ngày từ 08/10 đến 10/10/2024. Mong các bạn sinh viên chủ động trữ nước sinh hoạt và sắp xếp thời gian hợp lý.',
    image: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'news-4',
    title: 'Kết quả giải bóng đá mini nam sinh viên nội trú năm 2024',
    category: 'HOẠT ĐỘNG SV',
    date: '01/10/2024',
    summary: 'Trải qua 2 tuần thi đấu sôi nổi, giải bóng đá mini nam dành cho sinh viên nội trú đã tìm ra nhà vô địch là đội tuyển Tòa nhà A1.',
    content: 'Giải đấu quy tụ 12 đội bóng đến từ các tòa nhà KTX Đại học Đại Nam. Với tinh thần thể thao cao thượng, cống hiến và đoàn kết, giải đấu đã khép lại vô cùng thành công. Đội vô địch Tòa nhà B101 đã giành cúp vàng sau loạt sút luân lưu cân não với liên quân Tòa C.',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=400&q=80'
  }
];

export const INITIAL_APPLICATIONS: BookingApplication[] = [
  {
    id: 'app-1',
    fullName: 'Lê Văn Đạt',
    studentId: 'DNU204561',
    className: 'K16-QTKD',
    phone: '0912345678',
    email: 'datle@dainam.edu.vn',
    roomId: 'room-2',
    roomNumber: 'A102',
    building: 'Tòa A',
    paymentMethod: 'bank',
    status: 'Pending',
    createdAt: '2026-06-15 14:30',
    evidenceCCCD: 'cccd_front_datle.jpg',
    evidenceStudentCard: 'student_card_datle.jpg'
  },
  {
    id: 'app-2',
    fullName: 'Phạm Hồng Nhung',
    studentId: 'DNU205988',
    className: 'K15-Luat',
    phone: '0987654321',
    email: 'nhungpham@dainam.edu.vn',
    roomId: 'room-7',
    roomNumber: 'C107',
    building: 'Tòa C',
    paymentMethod: 'e-wallet',
    status: 'Pending',
    createdAt: '2026-06-17 09:15',
    evidenceCCCD: 'cccd_front_nhung.jpg',
    evidenceStudentCard: 'student_card_nhung.jpg'
  }
];

export const INITIAL_MAINTENANCE: MaintenanceRequest[] = [
  {
    id: 'maint-1',
    roomNumber: 'A203',
    title: 'Hỏng vòi rỉ nước lavabo',
    description: 'Vòi nước lavabo bị nứt rỉ nước liên tục gây lãng phí nước và ẩm ướt phòng vệ sinh.',
    category: 'Nước',
    priority: 'Normal',
    status: 'Pending',
    createdAt: '2026-06-16'
  },
  {
    id: 'maint-2',
    roomNumber: '101-Tòa B', // preassigned to Nguyễn Hữu Hưng
    title: 'Yêu cầu bảo trì khẩn cấp vỡ ống nước',
    description: 'Với ống nước tầng 3 nhà A2, nước chảy lênh láng hành lang, cần khắc phục gấp từ đội chuyên môn.',
    category: 'Nước',
    priority: 'Critical',
    status: 'Pending',
    createdAt: '2026-06-18'
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    roomNumber: '101-Tòa B',
    studentId: '1771020536',
    month: 'Tháng 6/2026',
    amount: 1200000,
    type: 'Tiền phòng',
    status: 'Paid',
    createdAt: '2026-06-01'
  },
  {
    id: 'inv-2',
    roomNumber: '101-Tòa B',
    studentId: '1771020536',
    month: 'Tháng 6/2026',
    amount: 185000,
    type: 'Điện nước',
    status: 'Paid',
    createdAt: '2026-06-05'
  }
];

export const INITIAL_TRANSFERS: TransferRequest[] = [];
