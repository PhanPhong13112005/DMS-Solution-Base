<script setup lang="ts">
import { ref, computed, watch, provide, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Building2, LogIn } from 'lucide-vue-next';

// Types
import type {
  User,
  Building,
  Room,
  Bed,
  RoomAmenity,
  Invoice,
  MaintenanceRequest,
  BookingApplication,
  TransferRequest,
  NewsArticle,
} from './types';

// Services
import { roomBuildingApi } from './services/room-building.service';
import { contractApi } from './services/contract.service';
import { billingApi } from './services/billing.service';
import { newsApi } from './services/api.service';

// Composables
import { useAppData, type AppData, type AppActions } from './composables/useAppData';

const route = useRoute();
const router = useRouter();

// ============ GLOBAL STATE (Loading & Error) ============
const isLoading = ref(true);
const apiError = ref<string | null>(null);

// ============ AUTHENTICATED USER ============
const loggedInUser = ref<User | null>(null);

// ============ ROOM BUILDING SERVICE (N1) DATA ============
const buildings = ref<Building[]>([]);
const rooms = ref<Room[]>([]);
const beds = ref<Bed[]>([]);
const amenities = ref<RoomAmenity[]>([]);

// ============ CONTRACT SERVICE (N2) DATA ============
const applications = ref<BookingApplication[]>([]);
const transfers = ref<TransferRequest[]>([]);

// ============ BILLING SERVICE (N3) DATA ============
const invoices = ref<Invoice[]>([]);
const maintenanceRequests = ref<MaintenanceRequest[]>([]);

// ============ NEWS & COMMUNICATIONS ============
const news = ref<NewsArticle[]>([]);

// ============ WATCHERS ============
/**
 * Watch route change to restore user from localStorage
 */
watch(
  () => route.path,
  () => {
    const cached = localStorage.getItem('current_user');
    if (cached) {
      try {
        loggedInUser.value = JSON.parse(cached);
      } catch (e) {
        console.error('Failed to parse cached user:', e);
        loggedInUser.value = null;
      }
    } else {
      loggedInUser.value = null;
    }
  },
  { immediate: true }
);

// ============ DATA LOADING LOGIC ============
/**
 * Load all data from 3 microservices in parallel
 * N1: Room Building Service
 * N2: Contract & Student Service
 * N3: Billing & Maintenance Service
 * + News Service
 */
const loadData = async () => {
  isLoading.value = true;
  apiError.value = null;

  try {
    // Parallel API calls to all 3 services + News
    const [
      buildingsData,
      roomsData,
      bedsData,
      amenitiesData,
      applicationsData,
      transfersData,
      invoicesData,
      maintenanceData,
      newsData,
    ] = await Promise.all([
      // N1: Room Building Service
      roomBuildingApi.buildings.getAll().catch((err) => {
        console.warn('⚠️ Failed to fetch buildings:', err);
        return [];
      }),
      roomBuildingApi.rooms.getAll().catch((err) => {
        console.warn('⚠️ Failed to fetch rooms:', err);
        return [];
      }),
      roomBuildingApi.beds.getAll().catch((err) => {
        console.warn('⚠️ Failed to fetch beds:', err);
        return [];
      }),
      roomBuildingApi.amenities.getAll().catch((err) => {
        console.warn('⚠️ Failed to fetch amenities:', err);
        return [];
      }),

      // N2: Contract & Student Service
      contractApi.applications.getAll().catch((err) => {
        console.warn('⚠️ Failed to fetch applications:', err);
        return [];
      }),
      contractApi.transfers.getAll().catch((err) => {
        console.warn('⚠️ Failed to fetch transfers:', err);
        return [];
      }),

      // N3: Billing & Maintenance Service
      billingApi.invoices.getAll().catch((err) => {
        console.warn('⚠️ Failed to fetch invoices:', err);
        return [];
      }),
      billingApi.maintenance.getAll().catch((err) => {
        console.warn('⚠️ Failed to fetch maintenance requests:', err);
        return [];
      }),

      // News Service
      newsApi.getAll().catch((err) => {
        console.warn('⚠️ Failed to fetch news:', err);
        return [];
      }),
    ]);

    let finalApps = applicationsData ?? [];
    
    // Update refs with fetched data
    buildings.value = buildingsData ?? [];
    rooms.value = roomsData ?? [];
    beds.value = bedsData ?? [];
    amenities.value = amenitiesData ?? [];
    applications.value = finalApps;
    transfers.value = transfersData ?? [];
    invoices.value = invoicesData ?? [];
    maintenanceRequests.value = maintenanceData ?? [];
    news.value = newsData ?? [];

    console.log('✅ Data loaded successfully from all 3 services (N1, N2, N3) + News');
  } catch (error) {
    apiError.value = error instanceof Error ? error.message : 'Lỗi kết nối API không xác định';
    console.error('❌ Error loading data:', apiError.value);
    // Continue with empty arrays - app won't crash
  } finally {
    isLoading.value = false;
  }
};

// ============ LIFECYCLE HOOKS ============
/**
 * Load data on app mount
 */
onMounted(() => {
  loadData();
});

// ============ HELPER FUNCTIONS ============
const showNavbar = computed(() => {
  const hiddenRoutes = ['/admin', '/staff', '/student'];
  return !hiddenRoutes.includes(route.path);
});

// ============ APP ACTIONS ============
/**
 * Define global actions for mutations and navigation
 */
const appActions: AppActions = {
  // Navigation & Auth
  logout: () => {
    loggedInUser.value = null;
    localStorage.removeItem('current_user');
    router.push('/auth');
  },

  navigate: (screenName: string) => {
    const routeMap: Record<string, string> = {
      Home: '/',
      Auth: '/auth',
      StudentPortal: '/student',
      AdminPortal: '/admin',
      StaffPortal: '/staff',
      Booking: '/booking',
      News: '/news',
      Rules: '/rules',
      Contact: '/contact',
      About: '/about',
    };
    const route = routeMap[screenName];
    if (route) router.push(route);
  },

  // Student Portal Actions
  addApplication: async (app: BookingApplication) => {
    await contractApi.applications.create(app);
    applications.value.unshift(app);
  },

  addMaintenance: async (req: MaintenanceRequest) => {
    const newReq = await billingApi.maintenance.create(req);
    maintenanceRequests.value.push(newReq);
  },

  updateMaintenanceStatus: async (id: string, status: MaintenanceRequest['status']) => {
    await billingApi.maintenance.updateStatus(id, status);
    const idx = maintenanceRequests.value.findIndex((r) => r.id === id);
    if (idx !== -1) {
      maintenanceRequests.value[idx].status = status;
    }
  },

  payInvoice: async (invoiceId: string) => {
    await billingApi.invoices.markAsPaid(invoiceId);
    const idx = invoices.value.findIndex((inv) => inv.id === invoiceId);
    if (idx !== -1) {
      invoices.value[idx].status = 'Paid';
    }
  },

  addTransfer: async (req: TransferRequest) => {
    // Implement API call if available, else just throw
    // await contractApi.transfers.create(req);
    transfers.value.push(req);
  },

  // Admin Portal Actions
  approveApplication: async (appId: string) => {
    await contractApi.applications.approve(appId);
    const idx = applications.value.findIndex((app) => String(app.id) === String(appId));
    if (idx !== -1) {
      applications.value[idx].status = 'Approved';
      applications.value[idx].updatedAt = new Date().toISOString();
      applications.value = [...applications.value];
    }
  },

  rejectApplication: async (appId: string) => {
    await contractApi.applications.reject(appId);
    const idx = applications.value.findIndex((app) => String(app.id) === String(appId));
    if (idx !== -1) {
      applications.value[idx].status = 'Rejected';
      applications.value[idx].updatedAt = new Date().toISOString();
      applications.value = [...applications.value];
    }
  },

  addNewsArticle: (article: NewsArticle) => {
    news.value.push(article);
  },

  deleteNewsArticle: (id: string) => {
    news.value = news.value.filter((n) => n.id !== id);
  },

  // Staff Portal Actions
  addInvoice: async (invoice: Invoice) => {
    try {
      // Phân tách nếu là hóa đơn thêm
      if (invoice.billType === 'EXTRA_FEE') {
        const newInv = await billingApi.invoices.createExtraFee({
          roomId: Number(invoice.roomNumber) || 0,
          studentId: Number(invoice.studentId) || 0,
          reason: invoice.feeReason || 'Khác',
          description: invoice.type,
          amount: invoice.amount
        });
        invoices.value.push(newInv);
      } else {
        const newInv = await billingApi.invoices.create(invoice);
        invoices.value.push(newInv);
      }
    } catch (error) {
      console.error('Failed to add invoice:', error);
      invoices.value.push(invoice);
    }
  },

  // Data Management
  loadData: loadData,
};

// ============ TYPE-SAFE PROVIDE/INJECT ============
/**
 * Provide typed AppData and AppActions to all child components
 * Components use: const { rooms, actions } = useAppData()
 */
const appData: AppData = {
  isLoading,
  apiError,
  user: loggedInUser,
  buildings,
  rooms,
  beds,
  amenities,
  applications,
  transfers,
  invoices,
  maintenanceRequests,
  news,
};

const handleLogout = () => {
  loggedInUser.value = null;
  localStorage.removeItem('current_user');
  router.push('/');
};

provide('appData', appData);
provide('appActions', appActions);
</script>

<template>
  <div class="app-container bg-background min-h-screen font-sans text-text-main">
    
    <nav v-if="showNavbar" class="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
      <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        <router-link to="/" class="flex items-center gap-3 group">
          <div class="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center group-hover:bg-primary-hover transition-colors">
            <Building2 class="w-5 h-5" />
          </div>
          <div>
            <h1 class="font-serif font-bold text-text-main text-lg leading-none tracking-tight group-hover:text-primary transition-colors">DNU KTX</h1>
            <p class="text-[10px] text-text-muted font-mono tracking-widest uppercase mt-1">Đại học Đại Nam</p>
          </div>
        </router-link>

        <div class="hidden md:flex items-center gap-8 text-sm font-semibold text-text-muted">
          <router-link to="/" active-class="text-secondary" class="hover:text-text-main transition-colors">Trang chủ</router-link>
          <router-link to="/about" active-class="text-secondary" class="hover:text-text-main transition-colors">Giới thiệu</router-link>
          <router-link to="/news" active-class="text-secondary" class="hover:text-text-main transition-colors">Tin tức</router-link>
          <router-link to="/booking" active-class="text-secondary" class="hover:text-text-main transition-colors">Đăng ký phòng</router-link>
          <router-link to="/rules" active-class="text-secondary" class="hover:text-text-main transition-colors">Nội quy</router-link>
          <router-link to="/contact" active-class="text-secondary" class="hover:text-text-main transition-colors">Liên hệ</router-link>
        </div>

        <div class="flex items-center gap-3">
          <router-link v-if="!loggedInUser" to="/auth" class="hidden md:flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-accent bg-accent/10 border border-accent/20 hover:bg-accent hover:text-white hover:border-accent rounded-full transition-all duration-300 shadow-xs hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
            <LogIn class="w-4 h-4" />
            <span>Cổng đăng nhập</span>
          </router-link>

          <div v-else class="relative group hidden md:block">
            <button class="flex items-center gap-2 px-4 py-2 bg-background rounded-full hover:bg-border transition-colors border border-border">
              <div class="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs uppercase">
                {{ loggedInUser.id.substring(0, 2) }}
              </div>
              <span class="text-sm font-semibold text-text-main">{{ loggedInUser.id }}</span>
            </button>
            
            <div class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
              <router-link :to="loggedInUser.role === 'Admin' ? '/admin' : loggedInUser.role === 'Staff' ? '/staff' : '/student'" class="block px-4 py-2 text-sm text-text-main hover:bg-background hover:text-secondary">
                Thông tin của tôi
              </router-link>
              <button @click="handleLogout" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                Đăng xuất
              </button>
            </div>
          </div>

        </div>

      </div>
    </nav>

    <router-view />
    
  </div>
</template>