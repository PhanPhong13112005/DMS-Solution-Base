<script setup lang="ts">
import { ref, computed, watch, provide } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Building2, LogIn } from 'lucide-vue-next';
import type { Room, MaintenanceRequest, Invoice, TransferRequest, BookingApplication, NewsArticle } from './types';

const route = useRoute();
const router = useRouter();

// ============ GLOBAL STATE ============
const loggedInUser = ref<any>({});

// Mock Data - Rooms
const mockRooms = ref<Room[]>([
  { 
    id: '1', 
    roomNumber: '101', 
    building: 'Tòa B', 
    capacity: 4, 
    available: 2, 
    size: 25, 
    price: 850000, 
    gender: 'Nam', 
    amenities: ['WC riêng', 'Máy lạnh'], 
    occupants: ['1771020535'] 
  },
  { 
    id: '2', 
    roomNumber: 'A102', 
    building: 'Tòa A', 
    capacity: 2, 
    available: 0, 
    size: 20, 
    price: 1200000, 
    gender: 'Nữ', 
    amenities: ['Máy lạnh'], 
    occupants: [] 
  }
]);

const mockInvoices = ref<Invoice[]>([
  { 
    id: 'inv-1', 
    roomNumber: '101-Tòa B', 
    studentId: '1771020535', 
    month: 'Tháng 6/2026', 
    amount: 850000, 
    type: 'Tiền phòng', 
    status: 'Unpaid', 
    createdAt: '2026-06-01' 
  }
]);

const mockMaintenance = ref<MaintenanceRequest[]>([
  { 
    id: 'maint-1', 
    roomNumber: '101-Tòa B', 
    title: 'Hỏng điều hòa', 
    description: 'Điều hòa chảy nước ở cục lạnh không mát', 
    category: 'Điện', 
    priority: 'Normal', 
    status: 'Pending', 
    createdAt: '2026-06-18' 
  }
]);

const mockApplications = ref<BookingApplication[]>([]);
const mockNews = ref<NewsArticle[]>([]);
const mockTransfers = ref<TransferRequest[]>([]);

// ============ WATCHERS ============
watch(
  () => route.path,
  () => {
    const cached = localStorage.getItem('current_user');
    if (cached) {
      try {
        loggedInUser.value = JSON.parse(cached);
      } catch {
        loggedInUser.value = {};
      }
    } else {
      loggedInUser.value = {};
    }
  },
  { immediate: true }
);

// ============ HELPER FUNCTIONS ============
const showNavbar = computed(() => {
  const hiddenRoutes = ['/admin', '/staff', '/student'];
  return !hiddenRoutes.includes(route.path);
});

// ============ GLOBAL ACTIONS (được provide cho toàn bộ component) ============
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

// ============ STUDENT PORTAL ACTIONS ============
const addMaintenance = (req: MaintenanceRequest) => {
  mockMaintenance.value.push(req);
};

const updateMaintenanceStatus = (id: string, status: 'Pending' | 'In Progress' | 'Resolved') => {
  const found = mockMaintenance.value.find(m => m.id === id);
  if (found) {
    found.status = status;
  }
};

const payInvoice = (invoiceId: string) => {
  const found = mockInvoices.value.find(i => i.id === invoiceId);
  if (found) {
    found.status = 'Paid';
  }
};

const addTransfer = (req: TransferRequest) => {
  mockTransfers.value.push(req);
};

// ============ ADMIN PORTAL ACTIONS ============
const approveApplication = (appId: string) => {
  const found = mockApplications.value.find(a => a.id === appId);
  if (found) {
    found.status = 'Approved';
  }
};

const rejectApplication = (appId: string) => {
  const found = mockApplications.value.find(a => a.id === appId);
  if (found) {
    found.status = 'Rejected';
  }
};

const addNewsArticle = (article: NewsArticle) => {
  mockNews.value.unshift(article);
};

const deleteNewsArticle = (id: string) => {
  mockNews.value = mockNews.value.filter(n => n.id !== id);
};

const addInvoice = (invoice: Invoice) => {
  mockInvoices.value.push(invoice);
};

// ============ PROVIDE GLOBAL DATA & ACTIONS ============
provide('appData', {
  user: loggedInUser,
  rooms: mockRooms,
  invoices: mockInvoices,
  maintenanceRequests: mockMaintenance,
  applications: mockApplications,
  news: mockNews,
  transfers: mockTransfers
});

provide('appActions', {
  logout: handleLogout,
  navigate: handleNavigation,
  // Student Portal Actions
  addMaintenance,
  updateMaintenanceStatus,
  payInvoice,
  addTransfer,
  // Admin Portal Actions
  approveApplication,
  rejectApplication,
  addNewsArticle,
  deleteNewsArticle,
  // Staff Portal Actions
  addInvoice
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

    <router-view />
    
  </div>
</template>