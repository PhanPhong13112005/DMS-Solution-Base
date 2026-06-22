<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { BookingApplication, NewsArticle, Room, Bed } from '../types';
import { useAppData } from '../composables/useAppData';
import { roomBuildingApi } from '../services/room-building.service'; 

// Import Icons
import { LayoutDashboard, Building2, Users, Banknote, Wrench, BarChart3, Plus, Shield, LogOut, ArrowUpRight, ArrowDownRight, Settings, PlusCircle, Trash2, Calendar, Newspaper, Activity, Landmark, BellRing, Info, AlertTriangle, CheckCircle } from 'lucide-vue-next';

// ============ USE TYPE-SAFE APP DATA & ACTIONS ============
const { user, applications, maintenanceRequests, invoices, news, actions } = useAppData();

const activeTab = ref<string>('Bảng điều khiển');
const toast = ref<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

// Mảng Menu Mới (Chuẩn DNU KTX)
const menuItems = [
  { id: 'Bảng điều khiển', icon: LayoutDashboard },
  { id: 'Cơ sở vật chất', icon: Building2 }, 
  { id: 'Sinh viên', icon: Users },          
  { id: 'Tài chính', icon: Banknote },       
  { id: 'Bảo trì', icon: Wrench },           
  { id: 'Báo cáo', icon: BarChart3 }
];

// ============ REAL DATA (DỮ LIỆU THẬT NHÓM 1) ============
const realTotalBeds = ref(0);
const realOccupiedBeds = ref(0);
const realAvailableBeds = ref(0);
const allBedsList = ref<any[]>([]);

const loadDashboardStats = async () => {
  try {
    const beds: any = await roomBuildingApi.beds.getAll();
    if (beds && beds.length > 0) {
        allBedsList.value = beds;
        realTotalBeds.value = beds.length;
        realOccupiedBeds.value = beds.filter((b: any) => !b.isAvailable).length; 
        realAvailableBeds.value = beds.filter((b: any) => b.isAvailable).length;
    }
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu thống kê từ N1:", error);
    showToast("Không thể kết nối đến máy chủ dữ liệu Gateway!", "error");
  }
};

onMounted(() => {
  loadDashboardStats();
});

// ============ COMPUTED (DỮ LIỆU MOCK N2, N3 TẠM THỜI) ============
const adminUser = computed(() => {
  if (user && user.value) {
    return user.value;
  }
  return { id: 'ADMIN', name: 'Admin' };
});
const pendingApps = computed(() => applications.value?.filter((a: BookingApplication) => a?.status === 'Pending') ?? []);
const activeIssues = computed(() => maintenanceRequests.value?.filter((m: any) => m?.status !== 'Resolved') ?? []);
const totalInvoicesPaidSum = computed(() => {
  const paidTotal = invoices.value?.filter((i: any) => i?.status === 'Paid')?.reduce((accum: number, i: any) => accum + (i?.amount ?? 0), 0) ?? 0;
  return paidTotal + 14500000; 
});

// ============ HELPER FUNCTIONS ============
const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
  toast.value = { message, type };
  setTimeout(() => { toast.value = null; }, 4000);
};
const handleLogout = () => actions.logout();
</script>

<template>
  <div class="w-full flex bg-[#FDFBF7] min-h-screen text-left border-t border-[#EAE7E1] text-[#4A4A4A]">
    
    <div v-if="toast" class="fixed top-5 right-5 z-[200] max-w-sm rounded-[20px] shadow-lg border p-4 flex items-start gap-3 bg-white border-[#EAE7E1] animate-fade-in">
      <CheckCircle v-if="toast.type === 'success'" class="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
      <AlertTriangle v-if="toast.type === 'error'" class="w-5 h-5 text-[#CB997E] shrink-0 mt-0.5" />
      <Info v-if="toast.type === 'info'" class="w-5 h-5 text-[#6B705C] shrink-0 mt-0.5" />
      <div class="text-xs font-semibold text-[#4A4A4A] leading-relaxed">{{ toast.message }}</div>
    </div>

    <aside class="w-64 bg-white text-[#4A4A4A] shrink-0 select-none flex flex-col justify-between border-r border-[#EAE7E1] p-0 z-10">
      <div class="p-5">
        <div class="flex items-center gap-3 mb-8">
          <div class="w-10 h-10 rounded-full bg-[#F97316] flex items-center justify-center text-white font-bold text-xs shrink-0">DNU</div>
          <div>
            <div class="font-bold text-[#A03500] text-xl leading-tight">DNU KTX</div>
            <div class="text-[11px] text-gray-500 font-medium">Cổng quản trị</div>
          </div>
        </div>

        <button class="w-full bg-[#F97316] hover:bg-[#E86305] text-white rounded-xl py-3 flex justify-center items-center gap-2 mb-6 font-medium text-sm transition-colors shadow-sm cursor-pointer">
          <Plus class="w-4 h-4" /> Đăng ký mới
        </button>

        <nav class="space-y-1 text-sm text-[#4A4A4A]">
          <button
            v-for="tab in menuItems"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'w-full flex items-center gap-3.5 px-4 py-3 rounded-lg font-medium cursor-pointer transition-all text-left relative', 
              activeTab === tab.id ? 'bg-[#FFF5F0] text-[#A03500] font-bold overflow-hidden' : 'hover:bg-gray-50 text-gray-600'
            ]"
          >
            <div v-if="activeTab === tab.id" class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/4 bg-[#A03500] rounded-r-md"></div>
            <component :is="tab.icon" :class="['w-5 h-5 shrink-0', activeTab === tab.id ? 'text-[#A03500]' : 'text-gray-500']" />
            <span>{{ tab.id }}</span>
          </button>
        </nav>
      </div>

      <div class="p-5 border-t border-[#EAE7E1]">
        <div class="p-3 bg-gray-50 rounded-xl flex items-center gap-3 mb-3">
          <div class="w-9 h-9 rounded-full bg-gray-200 text-gray-600 font-extrabold flex items-center justify-center border border-gray-300 font-mono text-sm leading-none shrink-0">AD</div>
          <div class="overflow-hidden">
            <div class="font-bold text-xs truncate text-gray-800">{{ adminUser?.name || 'Admin' }}</div>
            <div class="text-[10px] text-gray-500 font-mono">Quản trị tối cao</div>
          </div>
        </div>
        <button @click="handleLogout()" class="w-full py-2.5 bg-gray-50 hover:bg-red-50 hover:text-red-600 text-gray-600 rounded-xl transition-colors font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer">
          <LogOut class="w-4 h-4" /> <span>Đăng xuất</span>
        </button>
      </div>
    </aside>

    <main class="flex-1 flex flex-col min-h-screen overflow-y-auto bg-[#FDFBF7]">
      
      <header class="bg-white border-b border-[#EAE7E1] px-8 py-4.5 flex justify-between items-center shrink-0">
        <div class="text-[#4A4A4A]">
          <span class="text-xs text-[#8B8B8B] font-light">BẢNG QUẢN TRỊ TRUNG TÂM</span>
          <h2 class="font-serif font-light text-[#4A4A4A] text-lg leading-none mt-1">{{ activeTab }}</h2>
        </div>
        <div class="flex items-center gap-4">
          <div class="bg-[#F97316]/10 border border-[#F97316]/30 text-[#A03500] rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
            <Shield class="w-3.5 h-3.5" /> <span>ROOT ADMIN 🛡️</span>
          </div>
        </div>
      </header>

      <div class="p-8 flex-1 space-y-6">
        
        <div v-if="activeTab === 'Bảng điều khiển'" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
            <div class="bg-white p-6 rounded-[24px] border border-[#EAE7E1] shadow-xs space-y-2">
              <span class="text-[10px] text-[#8B8B8B] font-bold uppercase block">Học viên đang ở</span>
              <div class="text-2xl font-bold font-mono text-[#4A4A4A]">{{ realOccupiedBeds }} SV</div>
              <div class="text-[11px] text-emerald-700 font-semibold flex items-center gap-1"><ArrowUpRight class="w-4 h-4" /> <span>Hợp đồng có hiệu lực</span></div>
            </div>
            <div class="bg-white p-6 rounded-[24px] border border-[#EAE7E1] shadow-xs space-y-2">
              <span class="text-[10px] text-[#8B8B8B] font-bold uppercase block">Phòng (Giường) trống</span>
              <div class="text-2xl font-bold font-mono text-[#4A4A4A]">{{ realAvailableBeds }}</div>
              <div class="text-[11px] text-[#8B8B8B] font-light">Sẵn sàng phân bổ</div>
            </div>
            <div class="bg-white p-6 rounded-[24px] border border-[#EAE7E1] shadow-xs space-y-2">
              <span class="text-[10px] text-[#8B8B8B] font-bold uppercase block">Doanh số tổng hợp</span>
              <div class="text-2xl font-bold font-mono text-[#CB997E]">{{ new Intl.NumberFormat('vi-VN').format(totalInvoicesPaidSum) }}đ</div>
              <div class="text-[11px] text-[#6B705C] font-semibold flex items-center gap-1"><ArrowDownRight class="w-4 h-4" /> <span>Lệ phí kết toán niên vụ</span></div>
            </div>
            <div class="bg-white p-6 rounded-[24px] border border-[#EAE7E1] shadow-xs space-y-2">
              <span class="text-[10px] text-[#8B8B8B] font-bold uppercase block">Lỗi kỹ thuật điện nước</span>
              <div class="text-2xl font-bold font-mono text-[#CB997E]">{{ activeIssues.length }} Sự cố</div>
              <div class="text-[11px] text-[#CB997E] font-semibold flex items-center gap-1"><ArrowUpRight class="w-4 h-4" /> <span>Cần nhanh chóng khắc phục</span></div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'Cơ sở vật chất'" class="bg-white rounded-[32px] border border-[#EAE7E1] p-8 shadow-sm space-y-6 text-left">
          <div class="flex justify-between items-center border-b border-[#EAE7E1] pb-4">
            <h3 class="font-bold text-[#A03500] text-xl">Quản lý Tòa nhà & Phòng nội trú</h3>
            <button class="bg-[#F97316] hover:bg-[#E86305] text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer">
              <Plus class="w-4 h-4" /> Thêm Tòa/Phòng
            </button>
          </div>
          <div class="border border-dashed border-gray-300 rounded-2xl p-12 text-center bg-gray-50">
            <Building2 class="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h4 class="text-gray-600 font-bold mb-1">Khu vực hiển thị danh sách phòng</h4>
            <p class="text-xs text-gray-400">Trần sẽ thiết kế bảng Data Table (CRUD) gọi API lấy danh sách Tòa/Phòng vào đây.</p>
          </div>
        </div>

        <div v-if="activeTab === 'Sinh viên'" class="bg-white rounded-[32px] border border-[#EAE7E1] p-8 shadow-sm text-center py-20">
          <Users class="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 class="font-bold text-gray-600 text-lg">Quản lý Hồ sơ Sinh viên & Hợp đồng</h3>
          <p class="text-sm text-gray-400 mt-2">Khu vực dành cho Nhóm 2 gọi API hiển thị và duyệt hợp đồng.</p>
        </div>

        <div v-if="activeTab === 'Tài chính'" class="bg-white rounded-[32px] border border-[#EAE7E1] p-8 shadow-sm text-center py-20">
          <Banknote class="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 class="font-bold text-gray-600 text-lg">Quản lý Hóa đơn & Thanh toán</h3>
          <p class="text-sm text-gray-400 mt-2">Khu vực dành cho Nhóm 3 gọi API Invoices (Port 8082).</p>
        </div>

      </div>
    </main>
  </div>
</template>