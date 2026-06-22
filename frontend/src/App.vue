<script setup lang="ts">
import { ref, computed, watch, provide } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Building2, LogIn } from 'lucide-vue-next';
import type { Room, BookingApplication, MaintenanceRequest, NewsArticle, Invoice, TransferRequest } from './types';

const route = useRoute();
const router = useRouter();

// =============================================
// AUTH STATE
// =============================================
const loggedInUser = ref<any>({});

watch(
  () => route.path,
  () => {
    const cached = localStorage.getItem('current_user');
    if (cached) {
      loggedInUser.value = JSON.parse(cached);
    } else {
      loggedInUser.value = {};
    }
  },
  { immediate: true }
);

const handleLogout = () => {
  localStorage.removeItem('current_user');
  loggedInUser.value = {};
  router.push('/auth');
};

const handleNavigation = (screenName: string) => {
  const routes: Record<string, string> = {
    'Home': '/',
    'Auth': '/auth',
    'About': '/about',
    'News': '/news',
    'Rules': '/rules',
    'Contact': '/contact',
    'Booking': '/booking',
    'Admin': '/admin',
    'Staff': '/staff',
    'Student': '/student'
  };
  if (routes[screenName]) {
    router.push(routes[screenName]);
  }
};

// Ẩn Navbar khi ở các trang portal nội bộ
const showNavbar = computed(() => {
  const hiddenRoutes = ['/admin', '/staff', '/student'];
  return !hiddenRoutes.includes(route.path);
});

// =============================================
// STATE (MOCK DATA)
// =============================================
const mockRooms = ref<Room[]>([
  { id: '1', roomNumber: '101', building: 'Tòa B', capacity: 4, available: 2, size: 25, price: 850000, gender: 'Nam', amenities: ['WC riêng', 'Máy lạnh'], occupants: ['1771020535'] },
  { id: '2', roomNumber: 'A102', building: 'Tòa A', capacity: 2, available: 0, size: 20, price: 1200000, gender: 'Nữ', amenities: ['Máy lạnh'], occupants: [] },
  { id: '3', roomNumber: '305', building: 'Tòa C', capacity: 6, available: 4, size: 35, price: 500000, gender: 'Nam', amenities: [], occupants: [] }
]);

const mockApplications = ref<BookingApplication[]>([]);

const mockMaintenance = ref<MaintenanceRequest[]>([]);

const mockInvoices = ref<Invoice[]>([
  {
    id: 'HD001',
    displayId: 'PTT00001',
    roomNumber: '101',
    studentId: '1771020535',
    month: '06/2026',
    amount: 620000,
    roomFee: 500000,
    electricityFee: 50000,
    waterFee: 50000,
    serviceFee: 20000,
    type: 'Phí lưu trú tự động tháng 06/2026',
    status: 'Unpaid',
    createdAt: '2026-06-21'
  },
  {
    id: 'HD002',
    displayId: 'PTT00002',
    roomNumber: '101',
    studentId: '1771020535',
    month: '05/2026',
    amount: 150000,
    roomFee: 0,
    electricityFee: 100000,
    waterFee: 50000,
    serviceFee: 0,
    type: 'Hóa đơn phụ phí tháng 05/2026',
    status: 'Paid',
    createdAt: '2026-05-28'
  }
]);

const mockNews = ref<NewsArticle[]>([]);
const mockTransfers = ref<TransferRequest[]>([]);

import apiClient from './api/axios';

const fetchN3Data = async () => {
  if (loggedInUser.value && loggedInUser.value.role) {
    try {
      if (loggedInUser.value.role === 'Admin' || loggedInUser.value.role === 'Staff') {
        const billRes = await apiClient.get('/bills');
        mockInvoices.value = (billRes.data.data || billRes.data.Data || []).map((b: any, idx: number) => ({
          id: b.id,
          displayId: `PTT${String(idx + 1).padStart(5, '0')}`,
          roomNumber: b.roomId.toString(),
          studentId: b.studentId?.toString() || 'N/A',
          month: b.targetMonth,
          amount: b.totalAmount,
          type: b.title || 'Phí KTX', // Dùng tên thực tế từ Backend
          status: b.isPaid ? 'Paid' : 'Unpaid',
          createdAt: b.createdAt.split('T')[0]
        }));

        const maintRes = await apiClient.get('/maintenance');
        mockMaintenance.value = (maintRes.data.data || maintRes.data.Data || []).map((m: any, idx: number) => ({
          id: m.id,
          displayId: `SC${String(idx + 1).padStart(3, '0')}`,
          roomNumber: m.roomId.toString(),
          title: m.title,
          description: m.description,
          category: m.category === 'Electricity' ? 'Điện' : m.category === 'Water' ? 'Nước' : 'Khác',
          priority: m.priority,
          status: m.status === 'Completed' ? 'Resolved' : m.status,
          createdAt: m.createdAt.split('T')[0]
        }));
      } else if (loggedInUser.value.role === 'Student') {
        const sId = loggedInUser.value.referenceId;
        if (sId) {
          // 1. Xác định Room của sinh viên hiện tại
          const sIdStr = sId.toString();
          const studentRoom = mockRooms.value.find(r => r.occupants && r.occupants.includes(sIdStr));
          // API cần ID thực tế (vd: 101)
          const realRoomId = studentRoom ? parseInt(studentRoom.roomNumber) : 101;

          // 2. Fetch Hóa đơn theo mã Phòng (Vì Cán bộ phát hành hóa đơn cho phòng, không gán đích danh sinh viên)
          const billRes = await apiClient.get(`/bills/room/${realRoomId}`);
          mockInvoices.value = (billRes.data.data || billRes.data.Data || []).map((b: any, idx: number) => ({
            id: b.id,
            displayId: `PTT${String(idx + 1).padStart(5, '0')}`,
            roomNumber: b.roomId.toString(),
            studentId: b.studentId?.toString() || 'N/A',
            month: b.targetMonth,
            amount: b.totalAmount,
            type: b.title || 'Phí KTX', // Dùng tên thực tế từ Backend
            status: b.isPaid ? 'Paid' : 'Unpaid',
            createdAt: b.createdAt.split('T')[0]
          }));

          // 3. Fetch Báo hỏng theo mã Phòng
          const maintRes = await apiClient.get(`/maintenance/student/${sId}`);
          mockMaintenance.value = (maintRes.data.data || maintRes.data.Data || []).map((m: any, idx: number) => ({
            id: m.id,
            displayId: `SC${String(idx + 1).padStart(3, '0')}`,
            roomNumber: m.roomId.toString(), // Hoặc nối thêm tên tòa
            title: m.title,
            description: m.description,
            category: m.category === 'Electricity' ? 'Điện' : m.category === 'Water' ? 'Nước' : 'Khác',
            priority: m.priority,
            status: m.status === 'Completed' ? 'Resolved' : m.status,
            createdAt: m.createdAt.split('T')[0]
          }));
        }
      }
    } catch (error) {
      console.error("Lỗi fetch dữ liệu N3", error);
    }
  }
};

watch(
  () => loggedInUser.value,
  () => {
    if (loggedInUser.value && loggedInUser.value.role) {
      fetchN3Data();
    }
  },
  { deep: true, immediate: true }
);

// =============================================
// HANDLERS — dùng cho emit từ các Portal
// =============================================
const handleAddApplication = (app: BookingApplication) => {
  mockApplications.value.push(app);
};

const handleUpdateRoomVacancy = (roomId: string, decrement: boolean) => {
  const room = mockRooms.value.find(r => r.id === roomId);
  if (room) {
    if (decrement && room.available > 0) room.available--;
    else if (!decrement && room.available < room.capacity) room.available++;
  }
};

const handleApproveApplication = (appId: string) => {
  const app = mockApplications.value.find(a => a.id === appId);
  if (app) app.status = 'Approved';
};

const handleRejectApplication = (appId: string) => {
  const app = mockApplications.value.find(a => a.id === appId);
  if (app) app.status = 'Rejected';
};

const handleUpdateMaintenanceStatus = async (id: string, status: 'Pending' | 'In Progress' | 'Resolved') => {
  try {
    const backendStatus = status === 'Resolved' ? 'Completed' : status;
    await apiClient.put(`/maintenance/${id}/status`, `"${backendStatus}"`, {
      headers: { 'Content-Type': 'application/json' }
    });
    const req = mockMaintenance.value.find(m => m.id === id);
    if (req) req.status = status;
  } catch (error) {
    console.error("Lỗi cập nhật bảo trì", error);
  }
};

const handleAddNewsArticle = (article: NewsArticle) => {
  mockNews.value.unshift(article);
};

const handleDeleteNewsArticle = (id: string) => {
  mockNews.value = mockNews.value.filter(a => a.id !== id);
};

const handleAddInvoice = async (inv: Invoice) => {
  try {
    // Gọi API thật để tạo Bill
    await apiClient.post('/bills', {
      roomId: parseInt(inv.roomNumber.split('-')[0]) || 101,
      studentId: 0,
      contractId: "",
      title: inv.type, // Lưu lại loại phí thực tế từ modal
      targetMonth: inv.month,
      electricityCost: inv.electricityFee || 0,
      waterCost: inv.waterFee || 0,
      serviceFee: inv.amount - (inv.electricityFee || 0) - (inv.waterFee || 0),
      totalAmount: inv.amount,
      isPaid: false
    });
    fetchN3Data(); // Tải lại danh sách
  } catch (error) {
    console.error("Lỗi tạo hóa đơn", error);
  }
};

const handleAddMaintenance = async (req: MaintenanceRequest) => {
  try {
    await apiClient.post('/maintenance', {
      roomId: parseInt(req.roomNumber.split('-')[0]) || 101,
      title: req.title,
      description: req.description,
      category: req.category === 'Điện' ? 'Electricity' : req.category === 'Nước' ? 'Water' : 'Other',
      priority: req.priority
    });
    fetchN3Data();
  } catch (error) {
    console.error("Lỗi tạo yêu cầu bảo trì", error);
  }
};

const handlePayInvoice = async (invoiceId: string) => {
  try {
    await apiClient.put(`/bills/${invoiceId}/pay`);
    const inv = mockInvoices.value.find(i => i.id === invoiceId);
    if (inv) inv.status = 'Paid';
  } catch (error) {
    console.error("Lỗi thanh toán hóa đơn", error);
  }
};

const handleDeletePayment = (invoiceId: string) => {
  const inv = mockInvoices.value.find(i => i.id === invoiceId);
  if (inv) {
    inv.status = 'Unpaid';
    // Mở rộng sau: gọi API xóa thanh toán nếu backend hỗ trợ
  }
};

const handleDeleteInvoice = async (invoiceId: string) => {
  try {
    await apiClient.delete(`/bills/${invoiceId}`);
    mockInvoices.value = mockInvoices.value.filter(i => i.id !== invoiceId);
  } catch (error) {
    console.error("Lỗi xóa hóa đơn", error);
    // Silent fail or handle error notification if needed
  }
};

const handleAddTransfer = (req: TransferRequest) => {
  mockTransfers.value.push(req);
};

// =============================================
// PROVIDE — cho StudentPortal & NewsView dùng inject
// =============================================
provide('appData', {
  user: loggedInUser,
  rooms: mockRooms,
  maintenanceRequests: mockMaintenance,
  invoices: mockInvoices,
  news: mockNews,
  transferRequests: mockTransfers,
});

provide('actions', {
  logout: handleLogout,
  addMaintenance: handleAddMaintenance,
  updateMaintenanceStatus: handleUpdateMaintenanceStatus,
  payInvoice: handlePayInvoice,
  addTransfer: handleAddTransfer,
});
</script>

<template>
  <div class="app-container bg-[#FDFBF7] min-h-screen font-sans text-[#4A4A4A]">
    
    <nav v-if="showNavbar" class="bg-white border-b border-[#EAE7E1] sticky top-0 z-50 shadow-sm">
      <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        <router-link to="/" class="flex items-center gap-3 group">
          <div class="w-10 h-10 bg-[#6B705C] text-white rounded-xl flex items-center justify-center group-hover:bg-[#8B9178] transition-colors">
            <Building2 class="w-5 h-5" />
          </div>
          <div>
            <h1 class="font-serif font-bold text-[#4A4A4A] text-lg leading-none tracking-tight group-hover:text-[#6B705C] transition-colors">DNU KTX</h1>
            <p class="text-[10px] text-[#8B8B8B] font-mono tracking-widest uppercase mt-1">Đại học Đại Nam</p>
          </div>
        </router-link>

        <div class="hidden md:flex items-center gap-8 text-sm font-semibold text-[#8B8B8B]">
          <router-link to="/" active-class="text-[#CB997E]" class="hover:text-[#4A4A4A] transition-colors">Trang chủ</router-link>
          <router-link to="/about" active-class="text-[#CB997E]" class="hover:text-[#4A4A4A] transition-colors">Giới thiệu</router-link>
          <router-link to="/news" active-class="text-[#CB997E]" class="hover:text-[#4A4A4A] transition-colors">Tin tức</router-link>
          <router-link to="/rules" active-class="text-[#CB997E]" class="hover:text-[#4A4A4A] transition-colors">Nội quy</router-link>
          <router-link to="/contact" active-class="text-[#CB997E]" class="hover:text-[#4A4A4A] transition-colors">Liên hệ</router-link>
        </div>

        <div class="flex items-center gap-3">
          <router-link to="/auth" class="hidden md:flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-[#6B705C] hover:bg-[#FDFBF7] rounded-full transition-all border border-transparent hover:border-[#EAE7E1]">
            <LogIn class="w-4 h-4" />
            <span>Cổng đăng nhập</span>
          </router-link>
          <router-link to="/booking" class="px-6 py-2.5 bg-[#CB997E] hover:bg-[#b07f66] text-white text-sm font-bold rounded-full shadow-xs transition-colors">
            Đăng ký phòng
          </router-link>
        </div>

      </div>
    </nav>

    <!-- Dùng v-slot để truyền props xuống AdminPortal và StaffPortal -->
    <router-view v-slot="{ Component }">
      <component
        :is="Component"
        v-if="route.path === '/admin'"
        :user="loggedInUser"
        :rooms="mockRooms"
        :maintenanceRequests="mockMaintenance"
        :invoices="mockInvoices"
        :applications="mockApplications"
        @logout="handleLogout"
        @updateMaintenanceStatus="handleUpdateMaintenanceStatus"
        @addNewsArticle="handleAddNewsArticle"
        @deleteNewsArticle="handleDeleteNewsArticle"
        @deleteInvoice="handleDeleteInvoice"
        @payInvoice="handlePayInvoice"
        @deletePayment="handleDeletePayment"
      />
      <component
        :is="Component"
        v-else-if="route.path === '/staff'"
        :staff-user="loggedInUser"
        :rooms="mockRooms"
        :applications="mockApplications"
        :maintenance-requests="mockMaintenance"
        :invoices="mockInvoices"
        @logout="handleLogout"
        @approve-application="handleApproveApplication"
        @reject-application="handleRejectApplication"
        @update-room-vacancy="handleUpdateRoomVacancy"
        @update-maintenance-status="handleUpdateMaintenanceStatus"
        @add-invoice="handleAddInvoice"
        @pay-invoice="handlePayInvoice"
      />
      <component
        :is="Component"
        v-else-if="route.path === '/booking'"
        :rooms="mockRooms"
        @add-application="handleAddApplication"
        @update-room-vacancy="handleUpdateRoomVacancy"
      />
      <component :is="Component" v-else />
    </router-view>
    
  </div>
</template>