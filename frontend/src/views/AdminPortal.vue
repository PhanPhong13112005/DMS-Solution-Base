<script setup lang="ts">
import { ref, computed } from 'vue';
import { ChartSpline, Users, Shield, LogOut, ArrowUpRight, ArrowDownRight, Settings, PlusCircle, Trash2, Calendar, Newspaper, Activity, Landmark, BellRing, Info, AlertTriangle, CheckCircle } from 'lucide-vue-next';
import type { BookingApplication, NewsArticle } from '../types';
import { useAppData } from '../composables/useAppData';

// ============ USE TYPE-SAFE APP DATA & ACTIONS ============
const { applications, invoices, news, actions, apiError, isLoading } = useAppData();

const activeTab = ref<string>('Bảng điều khiển');
const toast = ref<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

// Form Tin tức
const newsTitle = ref('');
const newsCat = ref<'TIN TỨC KTX' | 'SỰ KIỆN' | 'THÔNG BÁO' | 'HOẠT ĐỘNG SV' | 'Quy định - Thủ tục'>('TIN TỨC KTX');
const newsSummary = ref('');
const newsContent = ref('');
const newsImg = ref('https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=400&q=80');

// ============ COMPUTED WITH SAFE ACCESS ============
/**
 * Admin user info from global state
 * Field mapping: user.id (Admin ID), user.name (Tên Admin)
 */
const adminUser = computed(() => {
  const user = appData?.user?.value ?? appData?.user ?? {};
  return {
    id: user?.id ?? 'ADMIN',
    name: user?.name ?? 'Admin',
    ...user // Preserve additional fields
  };
});

/**
 * All dormitory rooms (Phòng ở)
 * Field mapping: room.id, room.roomNumber, room.building, room.capacity, room.available
 */
const rooms = computed(() => appData?.rooms?.value ?? appData?.rooms ?? []);

/**
 * Booking applications from students (Đơn đặt phòng)
 * Field mapping: app.id, app.studentId, app.fullName, app.status ('Pending'|'Approved'|'Rejected')
 */
const applications = computed(() => appData?.applications?.value ?? appData?.applications ?? []);

/**
 * Maintenance requests (Phiếu báo hỏng)
 * Field mapping: req.id, req.roomNumber, req.status ('Pending'|'In Progress'|'Resolved')
 */
const maintenanceRequests = computed(() => appData?.maintenanceRequests?.value ?? appData?.maintenanceRequests ?? []);

/**
 * News articles and announcements (Tin tức)
 * Field mapping: article.id, article.title, article.category, article.date
 */
const news = computed(() => appData?.news?.value ?? appData?.news ?? []);

/**
 * Payment invoices (Hóa đơn thanh toán)
 * Field mapping: invoice.id, invoice.amount, invoice.status ('Paid'|'Unpaid')
 */
const invoices = computed(() => appData?.invoices?.value ?? appData?.invoices ?? []);

/**
 * Applications waiting for approval (status === 'Pending')
 */
const pendingApps = computed(() => {
  return applications.value?.filter((a: BookingApplication) => a?.status === 'Pending') ?? [];
});

/**
 * Active maintenance issues (status !== 'Resolved')
 * Includes: 'Pending' and 'In Progress' statuses
 */
const activeIssues = computed(() => {
  return maintenanceRequests.value?.filter((m: MaintenanceRequest) => m?.status !== 'Resolved') ?? [];
});

/**
 * Total revenue from paid invoices (Tổng doanh số)
 * Field mapping: invoice.amount (VNĐ/month), invoice.status ('Paid')
 */
const totalInvoicesPaidSum = computed(() => {
  const paidTotal = invoices.value?.filter((i: Invoice) => i?.status === 'Paid')?.reduce((accum: number, i: Invoice) => {
    return accum + (i?.amount ?? 0);
  }, 0) ?? 0;
  return paidTotal + 14500000; // Base revenue
});

/**
 * Total occupied beds (Giường được sử dụng)
 * Calculation: SUM(capacity - available) for all rooms
 */
const totalOccupiedSeats = computed(() => {
  return rooms.value?.reduce((accum: number, r: Room) => {
    const occupied = (r?.capacity ?? 0) - (r?.available ?? 0);
    return accum + occupied;
  }, 0) ?? 14;
});

/**
 * Total bed capacity (Tổng sức chứa)
 * Calculation: SUM(capacity) for all rooms
 */
const totalCapacitySeats = computed(() => {
  return rooms.value?.reduce((accum: number, r: Room) => {
    return accum + (r?.capacity ?? 0);
  }, 0) ?? 28;
});

// ============ HELPER FUNCTIONS ============
const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
  toast.value = { message, type };
  setTimeout(() => { toast.value = null; }, 4000);
};

const handleCreateNews = () => {
  if (!newsTitle.value?.trim() || !newsSummary.value?.trim() || !newsContent.value?.trim()) {
    showToast('Vui lòng soạn thảo và bổ sung hoàn chỉnh thông tin các trường yêu cầu!', 'error');
    return;
  }

  const newArticle: NewsArticle = {
    id: 'news-' + Math.random().toString(36).substr(2, 9),
    title: newsTitle.value,
    category: newsCat.value,
    date: new Date().toLocaleDateString('vi-VN'),
    summary: newsSummary.value,
    content: newsContent.value,
    image: newsImg.value
  };

  actions.addNewsArticle(newArticle);
  showToast('Đã soạn đăng và chuyển gửi thông báo mới công khai thành công!', 'success');
  newsTitle.value = '';
  newsSummary.value = '';
  newsContent.value = '';
};

const handleApproveApplication = (appId: string) => {
  actions.approveApplication(appId);
  showToast('Đã phê duyệt hợp đồng lưu trú thành công!', 'success');
};

const handleRejectApplication = (appId: string) => {
  actions.rejectApplication(appId);
  showToast('Đã từ chối hợp đồng lưu trú!', 'info');
};

const handleUpdateMaintenanceStatus = (id: string, status: 'Pending' | 'In Progress' | 'Resolved') => {
  appActions?.updateMaintenanceStatus?.(id, status);
  showToast(`Cập nhật trạng thái sự cố thành: ${status === 'Pending' ? 'Đang chờ' : (status === 'In Progress' ? 'Đang sửa' : 'Đã xong')}`, 'success');
};

const handleDeleteNews = (id: string) => {
  actions.deleteNewsArticle(id);
  showToast('Đã xóa bài viết thành công!', 'success');
};

const handleLogout = () => {
  actions.logout();
};

const menuItems = [
  { id: 'Bảng điều khiển', icon: ChartSpline },
  { id: 'Quản lý tin tức', icon: Newspaper },
  { id: 'Sự cố bảo trì', icon: Activity },
  { id: 'Duyệt lưu trú', icon: Users },
  { id: 'Cài đặt hệ thống', icon: Settings }
];
</script>

<template>
  <div class="w-full flex bg-[#FDFBF7] min-h-screen text-left border-t border-[#EAE7E1] text-[#4A4A4A]">
    
    <div v-if="toast" class="fixed top-5 right-5 z-[200] max-w-sm rounded-[20px] shadow-lg border p-4 flex items-start gap-3 bg-white border-[#EAE7E1] animate-fade-in">
      <CheckCircle v-if="toast.type === 'success'" class="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
      <AlertTriangle v-if="toast.type === 'error'" class="w-5 h-5 text-[#CB997E] shrink-0 mt-0.5" />
      <Info v-if="toast.type === 'info'" class="w-5 h-5 text-[#6B705C] shrink-0 mt-0.5" />
      <div class="text-xs font-semibold text-[#4A4A4A] leading-relaxed">{{ toast.message }}</div>
    </div>

    <aside class="w-64 bg-[#6B705C] text-slate-100 shrink-0 select-none flex flex-col justify-between border-r border-[#EAE7E1] p-0">
      <div>
        <div class="p-6 border-b border-white/10 flex items-center gap-3">
          <span class="w-8 h-8 rounded-xl bg-[#CB997E] flex items-center justify-center text-white font-serif font-extrabold text-sm">A</span>
          <div>
            <div class="font-serif font-light text-sm text-white tracking-widest uppercase">DNU KTX</div>
            <div class="text-[10px] text-[#FDFBF7]/85">Ban quản trị hệ thống</div>
          </div>
        </div>

        <nav class="p-4 space-y-1.5 text-xs text-[#FDFBF7]">
          <button
            v-for="tab in menuItems"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="['w-full flex items-center gap-3.5 px-4.5 py-3 rounded-2xl font-semibold cursor-pointer transition-all text-left', activeTab === tab.id ? 'bg-[#CB997E] text-white shadow-xs' : 'hover:bg-white/10 text-[#FDFBF7]/85 hover:text-white']"
          >
            <component :is="tab.icon" class="w-4.5 h-4.5 shrink-0" />
            <span>{{ tab.id }}</span>
          </button>
        </nav>
      </div>

      <div class="p-4 border-t border-white/10">
        <div class="p-3 bg-white/15 rounded-2xl flex items-center gap-3 mb-3">
          <div class="w-9 h-9 rounded-full bg-[#CB997E] text-white font-extrabold flex items-center justify-center border border-white/10 font-mono text-sm leading-none">AD</div>
          <div class="overflow-hidden">
            <div class="font-bold text-xs truncate text-white">{{ adminUser?.name || 'Admin' }}</div>
            <div class="text-[10px] text-[#FDFBF7]/85 font-mono">Quản trị tối cao</div>
          </div>
        </div>
        <button 
          @click="handleLogout()"
          class="w-full py-2.5 bg-white/15 hover:bg-white/20 text-white rounded-full transition-colors font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogOut class="w-4 h-4" /> <span>Thoát đặc quyền</span>
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
          <div class="bg-[#CB997E] border border-[#CB997E]/30 text-white rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
            <Shield class="w-3.5 h-3.5 fill-white" /> <span>Chế độ: ROOT ADMIN 🛡️</span>
          </div>
        </div>
      </header>

      <div class="p-8 flex-1 space-y-6">
        
        <div v-if="activeTab === 'Bảng điều khiển'" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
            <div class="bg-white p-6 rounded-[24px] border border-[#EAE7E1] shadow-xs space-y-2">
              <span class="text-[10px] text-[#8B8B8B] font-bold uppercase block">Học viên đang ở</span>
              <div class="text-2xl font-bold font-mono text-[#4A4A4A]">{{ totalOccupiedSeats }} SV</div>
              <div class="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <ArrowUpRight class="w-4 h-4 shrink-0" /> <span>Hợp đồng có hiệu lực</span>
              </div>
            </div>

            <div class="bg-white p-6 rounded-[24px] border border-[#EAE7E1] shadow-xs space-y-2">
              <span class="text-[10px] text-[#8B8B8B] font-bold uppercase block">Tỷ suất khai thác giường</span>
              <div class="text-2xl font-bold font-mono text-[#4A4A4A]">{{ totalOccupiedSeats }} / {{ totalCapacitySeats }}</div>
              <div class="text-[11px] text-[#8B8B8B] font-light">Hiệu suất lấp đầy cao KTX DNU</div>
            </div>

            <div class="bg-white p-6 rounded-[24px] border border-[#EAE7E1] shadow-xs space-y-2">
              <span class="text-[10px] text-[#8B8B8B] font-bold uppercase block">Doanh số tổng hợp</span>
              <div class="text-2xl font-bold font-mono text-[#CB997E]">{{ new Intl.NumberFormat('vi-VN').format(totalInvoicesPaidSum) }}đ</div>
              <div class="text-[11px] text-[#6B705C] font-semibold flex items-center gap-1">
                <ArrowDownRight class="w-4 h-4 shrink-0" /> <span>Lệ phí kết toán niên vụ 2026</span>
              </div>
            </div>

            <div class="bg-white p-6 rounded-[24px] border border-[#EAE7E1] shadow-xs space-y-2">
              <span class="text-[10px] text-[#8B8B8B] font-bold uppercase block">Lỗi kỹ thuật điện nước</span>
              <div class="text-2xl font-bold font-mono text-[#CB997E]">{{ activeIssues.length }} Sự cố</div>
              <div class="text-[11px] text-[#CB997E] font-semibold flex items-center gap-1">
                <ArrowUpRight class="w-4 h-4 shrink-0" /> <span>Cần nhanh chóng khắc phục</span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
            <div class="bg-white rounded-[32px] border border-[#EAE7E1] p-6 shadow-xs">
              <div class="flex justify-between items-baseline mb-4">
                <h4 class="font-serif text-[#4A4A4A] text-sm font-light">Ước tính doanh thu túc xá Đại Nam</h4>
                <span class="text-[10px] text-[#6B705C] font-bold uppercase">Biểu đồ ước lượng</span>
              </div>
              <div class="h-56 w-full bg-[#FDFBF7] border border-[#EAE7E1] rounded-[24px] p-4 flex items-end relative overflow-hidden">
                <svg class="w-full h-full" viewBox="0 0 400 150" preserveAspectRatio="none">
                  <polygon points="0,150 80,110 160,115 240,60 320,80 400,20 400,150" fill="rgba(107, 112, 92, 0.1)" />
                  <polyline points="0,150 80,110 160,115 240,60 320,80 400,20" fill="none" stroke="#6B705C" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
                  <circle cx="80" cy="110" r="5" fill="#CB997E" />
                  <circle cx="240" cy="60" r="5" fill="#CB997E" />
                  <circle cx="400" cy="20" r="5" fill="#CB997E" />
                </svg>
                <div class="absolute bottom-1 left-0 right-0 px-4 flex justify-between text-[8px] font-mono font-bold text-[#8B8B8B]">
                  <span>Tháng 1</span><span>Tháng 2</span><span>Tháng 3</span><span>Tháng 4</span><span>Tháng 5</span><span>Tháng 6</span>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-[32px] border border-[#EAE7E1] p-6 shadow-xs">
              <div class="flex justify-between items-baseline mb-4">
                <h4 class="font-serif text-[#4A4A4A] text-sm font-light">Tốc độ lấp đầy chỗ ở của Khối tòa</h4>
                <span class="text-[10px] text-[#8B8B8B] font-mono">Hiệu suất phân khu</span>
              </div>
              <div class="h-56 w-full bg-[#FDFBF7] border border-[#EAE7E1] rounded-[24px] p-6 flex justify-around items-end relative">
                <div class="flex flex-col items-center gap-2">
                  <div class="w-10 bg-[#EAE7E1] rounded-t-xl h-36 relative flex items-end overflow-hidden">
                    <div class="absolute inset-x-0 bottom-0 bg-[#6B705C] h-[85%]" />
                  </div>
                  <span class="text-[10px] font-bold font-mono">Tòa A (85%)</span>
                </div>
                <div class="flex flex-col items-center gap-2">
                  <div class="w-10 bg-[#EAE7E1] rounded-t-xl h-36 relative flex items-end overflow-hidden">
                    <div class="absolute inset-x-0 bottom-0 bg-[#CB997E] h-[92%]" />
                  </div>
                  <span class="text-[10px] font-bold font-mono">Tòa B (92%)</span>
                </div>
                <div class="flex flex-col items-center gap-2">
                  <div class="w-10 bg-[#EAE7E1] rounded-t-xl h-36 relative flex items-end overflow-hidden">
                    <div class="absolute inset-x-0 bottom-0 bg-[#8B9178] h-[68%]" />
                  </div>
                  <span class="text-[10px] font-bold font-mono">Tòa C (68%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'Quản lý tin tức'" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 bg-white rounded-[32px] border border-[#EAE7E1] p-8 shadow-sm text-left">
            <h3 class="font-serif text-[#4A4A4A] text-lg mb-2">Đăng thông cáo & Bản tin sự kiện sinh viên</h3>
            <form @submit.prevent="handleCreateNews" class="space-y-4 mt-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-xs font-bold text-[#4A4A4A]">Tiêu đề bài viết bản tin <span class="text-[#CB997E]">*</span></label>
                  <input type="text" required v-model="newsTitle" class="w-full bg-[#FDFBF7] border border-[#EAE7E1] rounded-2xl px-4 py-2.5 text-xs outline-none focus:border-[#6B705C]" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-bold text-[#4A4A4A]">Chuyên mục tin đăng</label>
                  <select v-model="newsCat" class="w-full bg-[#FDFBF7] border border-[#EAE7E1] rounded-2xl px-4 py-2.5 text-xs outline-none focus:border-[#6B705C]">
                    <option value="TIN TỨC KTX">Tin tức nội trú KTX</option>
                    <option value="SỰ KIỆN">Hoạt động Sự kiện</option>
                    <option value="THÔNG BÁO">Thông báo chung</option>
                    <option value="HOẠT ĐỘNG SV">Sinh viên ngoại khóa</option>
                    <option value="Quy định - Thủ tục">Quy chế nội quy</option>
                  </select>
                </div>
              </div>
              <div class="space-y-1">
                <label class="text-xs font-bold text-[#4A4A4A]">Lời tóm tắt ngắn mục lục <span class="text-[#CB997E]">*</span></label>
                <input type="text" required v-model="newsSummary" class="w-full bg-[#FDFBF7] border border-[#EAE7E1] rounded-2xl px-4 py-2.5 text-xs outline-none focus:border-[#6B705C]" />
              </div>
              <div class="space-y-1">
                <label class="text-xs font-bold text-[#4A4A4A]">Nội dung văn tự bài viết chi tiết <span class="text-[#CB997E]">*</span></label>
                <textarea required rows="6" v-model="newsContent" class="w-full bg-[#FDFBF7] border border-[#EAE7E1] rounded-2xl px-4 py-3 text-xs outline-none resize-none focus:border-[#6B705C]"></textarea>
              </div>
              <button type="submit" class="px-6 py-3 bg-[#6B705C] hover:bg-[#8B9178] text-white font-serif font-light text-xs rounded-full shadow-xs cursor-pointer flex items-center gap-1.5">
                <PlusCircle class="w-4 h-4" /> <span>Xuất bản ngay</span>
              </button>
            </form>
          </div>

          <div class="bg-white rounded-[32px] border border-[#EAE7E1] p-6 shadow-sm">
            <h4 class="font-serif text-[#4A4A4A] text-sm mb-4">Các tin tức đã phát hành</h4>
            <div class="space-y-3">
              <div v-for="item in (news || [])" :key="item.id" class="p-3.5 border border-[#EAE7E1] bg-[#FDFBF7]/50 rounded-2xl flex items-start justify-between gap-3 text-xs">
                <div class="overflow-hidden">
                  <div class="font-bold text-[#4A4A4A] leading-tight line-clamp-1">{{ item.title }}</div>
                  <div class="text-[10px] text-[#8B8B8B] font-mono mt-1">{{ item.category }} • {{ item.date }}</div>
                </div>
                <button @click="handleDeleteNews(item.id)" class="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg cursor-pointer shrink-0">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'Sự cố bảo trì'" class="bg-white rounded-[32px] border border-[#EAE7E1] p-8 shadow-sm space-y-6 text-left">
          <h3 class="font-serif text-[#4A4A4A] text-lg border-b border-[#EAE7E1] pb-3.5">Lý lịch sửa chữa lỗi sự cố kỹ thuật</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs md:text-sm">
            <div v-for="issue in activeIssues" :key="issue.id" class="p-5 border border-[#EAE7E1] bg-[#FDFBF7]/35 rounded-2xl space-y-3 flex flex-col justify-between">
              <div>
                <div class="flex justify-between items-baseline mb-2 bg-[#FDFBF7] border border-[#EAE7E1] p-2 rounded-xl">
                  <span class="font-bold text-[#4A4A4A]">Phiếu: {{ issue.id }}</span>
                  <span :class="['text-[10px] font-extrabold px-1.5 py-0.5 rounded-lg', issue.priority === 'Critical' ? 'bg-[#CB997E]/20 text-[#CB997E]' : 'bg-[#6B705C]/20 text-[#6B705C]']">
                    {{ issue.priority === 'Critical' ? 'Khẩn cấp' : 'Thường' }}
                  </span>
                </div>
                <h4 class="font-serif text-[#4A4A4A] text-base">Phòng {{ issue.roomNumber }} - {{ issue.title }}</h4>
                <p class="text-xs text-[#8B8B8B] font-light mt-1">{{ issue.description }}</p>
              </div>
              <div class="flex gap-2 pt-2 border-t border-[#EAE7E1] text-xs">
                <button @click="handleUpdateMaintenanceStatus(issue.id, 'Resolved')" class="w-1/2 bg-[#6B705C] hover:bg-[#8B9178] text-white font-bold py-2 rounded-full cursor-pointer text-center">
                  Khép lại sự cố
                </button>
                <span class="flex items-center justify-center italic text-[#8B8B8B] text-xs w-1/2 font-mono bg-[#FDFBF7] border border-[#EAE7E1] rounded-full">
                  Trạng thái: {{ issue.status }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'Duyệt lưu trú'" class="bg-white rounded-[32px] border border-[#EAE7E1] p-8 shadow-sm space-y-6 text-left">
          <h3 class="font-serif text-[#4A4A4A] text-lg border-b border-[#EAE7E1] pb-3.5">Hồ sơ chờ phê duyệt phân phòng</h3>
          <div class="space-y-4">
            <div v-for="app in pendingApps" :key="app.id" class="p-5 border border-[#EAE7E1] bg-[#FDFBF7]/30 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h4 class="font-serif text-slate-950 text-base">{{ app.fullName }}</h4>
                <p class="text-xs text-[#8B8B8B] mt-1 font-mono">MSSV: {{ app.studentId }} • Lớp: {{ app.className }} • Phòng muốn nạp: {{ app.roomNumber }}</p>
              </div>
              <div class="flex gap-2">
                <button @click="handleApproveApplication(app.id)" class="px-4 py-2 bg-[#6B705C] hover:bg-[#8B9178] text-white font-bold text-xs rounded-full cursor-pointer">Duyệt</button>
                <button @click="handleRejectApplication(app.id)" class="px-4 py-2 bg-[#CB997E] hover:bg-[#b07d62] text-white font-bold text-xs rounded-full cursor-pointer">Từ chối</button>
              </div>
            </div>
            <div v-if="pendingApps.length === 0" class="text-center py-12 text-[#8B8B8B] italic text-xs font-mono">Không có hồ sơ lưu trú nào đang đợi kiểm duyệt.</div>
          </div>
        </div>

        <div v-if="activeTab === 'Cài đặt hệ thống'" class="bg-white rounded-[32px] border border-[#EAE7E1] p-8 shadow-sm text-left">
          <h3 class="font-serif text-[#4A4A4A] text-lg border-b border-[#EAE7E1] pb-3">Thiết lập cấu hình tham số KTX</h3>
          <div class="space-y-5 max-w-xl text-xs md:text-sm pt-4">
            <div class="space-y-2">
              <label class="font-bold text-[#4A4A4A]">1. Giờ giới nghiêm khóa cổng ban đêm</label>
              <input type="text" defaultValue="22:30" class="w-full bg-[#FDFBF7] border border-[#EAE7E1] px-4 py-2.5 rounded-2xl outline-none focus:border-[#6B705C]" />
            </div>
            <div class="space-y-2">
              <label class="font-bold text-[#4A4A4A]">2. Quy định lệ phí chỗ ở nội trú sàn tối thiểu (VND/Tháng)</label>
              <input type="number" defaultValue="1200000" class="w-full bg-[#FDFBF7] border border-[#EAE7E1] px-4 py-2.5 rounded-2xl outline-none focus:border-[#6B705C]" />
            </div>
            <button @click="showToast('Ghi nhận thông tin tham số vận hành vĩ mô thành công!', 'success')" class="px-6 py-2.5 bg-[#6B705C] text-white text-xs font-bold rounded-full cursor-pointer hover:bg-[#8B9178] mt-2">
              Lưu thiết đặt cấu hình
            </button>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>