<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePagination } from '../composables/usePagination';
import { LayoutDashboard, Users, UserPlus, Wrench, ShieldAlert, CheckCircle, LogOut, Search, Building, Receipt, FilePlus, AlertTriangle, Info, CheckCircle2 } from 'lucide-vue-next';
import type { Room, BookingApplication, MaintenanceRequest, Invoice } from '../types';

const props = defineProps<{
  staffUser: any;
  rooms: Room[];
  applications: BookingApplication[];
  maintenanceRequests: MaintenanceRequest[];
}>();

const emit = defineEmits<{
  (e: 'logout'): void;
  (e: 'approveApplication', appId: string): void;
  (e: 'rejectApplication', appId: string): void;
  (e: 'updateRoomVacancy', roomId: string, decrement: boolean): void;
  (e: 'updateMaintenanceStatus', id: string, status: 'Pending' | 'In Progress' | 'Resolved'): void;
  (e: 'addInvoice', inv: Invoice): void;
}>();

const activeTab = ref('Tổng quan');
const searchQuery = ref('');
const toast = ref<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

// Form Khởi tạo hóa đơn
const billRoom = ref('101-Tòa B');
const billMonth = ref('Tháng 6/2026');
const billType = ref<'Điện nước' | 'Phí dịch vụ'>('Điện nước');
const billAmount = ref('');

const pendingApps = computed(() => props.applications.filter(a => a.status === 'Pending'));
const activeIssues = computed(() => props.maintenanceRequests.filter(m => m.status !== 'Resolved'));
const urgentIssues = computed(() => activeIssues.value.filter(i => i.priority === 'Critical'));

const { paginatedItems: pIssues, currentPage: cpIssues, totalPages: tpIssues, nextPage: npIssues, prevPage: ppIssues } = usePagination(activeIssues, 4);

const totalVacantSlots = computed(() => props.rooms.reduce((accum, r) => accum + r.available, 0));

const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
  toast.value = { message, type };
  setTimeout(() => { toast.value = null; }, 4000);
};

const handleCreateBill = () => {
  if (!billRoom.value || !billAmount.value) {
    showToast('Vui lòng khai nhập mã hiệu phòng và số tiền hóa đơn!', 'error');
    return;
  }
  const amt = parseFloat(billAmount.value);
  if (isNaN(amt) || amt <= 0) {
    showToast('Số tiền hóa đơn nhập vào chưa hợp lệ!', 'error');
    return;
  }
  const newInvoice: Invoice = {
    id: 'inv-' + Math.random().toString(36).substr(2, 9),
    roomNumber: billRoom.value,
    studentId: 'DNU-COMMON',
    month: billMonth.value,
    amount: amt,
    type: billType.value,
    status: 'Unpaid',
    createdAt: new Date().toISOString().split('T')[0]
  };
  emit('addInvoice', newInvoice);
  showToast('Phát hành biểu mẫu hóa đơn thành công! Hệ thống đã gửi báo phí tới phòng liên đới.', 'success');
  billAmount.value = '';
};

const menuItems = [
  { id: 'Tổng quan', icon: LayoutDashboard },
  { id: 'Duyệt hồ sơ', icon: UserPlus },
  { id: 'Sự cố bảo trì', icon: Wrench },
  { id: 'Trưng cứu Sinh viên', icon: Users },
  { id: 'Trưng cứu Phòng', icon: Building },
  { id: 'Khởi tạo hóa đơn', icon: Receipt }
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
          <span class="w-8 h-8 rounded-xl bg-[#CB997E] flex items-center justify-center text-white font-serif font-extrabold text-sm">C</span>
          <div>
            <div class="font-serif font-light text-sm text-white tracking-widest uppercase">DNU KTX</div>
            <div class="text-[10px] text-[#FDFBF7]/85">Phòng trực ban cán bộ</div>
          </div>
        </div>
        <nav class="p-4 space-y-1.5 text-xs">
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
          <div class="w-9 h-9 rounded-full bg-[#CB997E] text-white font-extrabold flex items-center justify-center font-mono text-sm">CB</div>
          <div class="overflow-hidden">
            <div class="font-bold text-xs truncate text-white">{{ staffUser.name }}</div>
            <div class="text-[10px] text-[#FDFBF7]/80">Cán bộ trực ban</div>
          </div>
        </div>
        <button @click="emit('logout')" class="w-full py-2.5 bg-white/15 hover:bg-white/20 text-white rounded-full text-xs font-bold flex items-center justify-center gap-2 cursor-pointer">
          <LogOut class="w-4 h-4" /> <span>Thoát cán bộ</span>
        </button>
      </div>
    </aside>

    <main class="flex-1 flex flex-col min-h-screen overflow-y-auto bg-[#FDFBF7]">
      <header class="bg-white border-b border-[#EAE7E1] px-8 py-4.5 flex justify-between items-center shrink-0">
        <div class="text-[#4A4A4A]">
          <span class="text-xs text-[#8B8B8B] font-light">BẢNG VẬN HÀNH KTX ĐẠI NAM</span>
          <h2 class="font-serif font-light text-[#4A4A4A] text-lg leading-none mt-1">{{ activeTab }}</h2>
        </div>
        <div class="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-full px-4 py-1.5 text-xs font-bold uppercase">Phiên trực: Đang mở ⚡</div>
      </header>

      <div class="p-8 flex-1 space-y-6">
        
        <div v-if="activeTab === 'Tổng quan'" class="space-y-6">
          <div v-if="urgentIssues.length > 0" class="bg-[#CB997E]/10 border border-[#CB997E]/30 p-5 rounded-[24px] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div class="flex items-start gap-4">
              <div class="w-11 h-11 rounded-full bg-[#CB997E]/20 text-[#CB997E] flex items-center justify-center shrink-0 mt-1">
                <ShieldAlert class="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <span class="text-[10px] bg-[#CB997E] text-white font-extrabold uppercase px-2 py-0.5 rounded-md">CẢNH BÁO SỰ CỐ KHẨN</span>
                <h4 class="font-serif font-light text-[#4A4A4A] text-base mt-2">{{ urgentIssues[0].title }}</h4>
                <p class="text-xs text-[#8B8B8B] font-light mt-1">Mô tả thực trạng: {{ urgentIssues[0].description }} (Vị trí: {{ urgentIssues[0].roomNumber }})</p>
              </div>
            </div>
            <button @click="onUpdateMaintenanceStatus(urgentIssues[0].id, 'In Progress'); showToast('Đã cử kĩ sư hiện trường!', 'success');" class="px-5 py-2.5 bg-[#6B705C] hover:bg-[#8B9178] text-white font-bold text-xs rounded-full shadow-xs cursor-pointer">
              Cử kỹ sư xử lý ngay
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white p-5 rounded-[24px] border border-[#EAE7E1] shadow-xs">
              <span class="text-[10px] text-[#8B8B8B] font-bold uppercase block mb-1">Đơn tuyển ký phòng</span>
              <div class="text-xl font-bold text-[#4A4A4A] font-mono mt-1.5">{{ pendingApps.length }} đơn chờ</div>
            </div>
            <div class="bg-white p-5 rounded-[24px] border border-[#EAE7E1] shadow-xs">
              <span class="text-[10px] text-[#8B8B8B] font-bold uppercase block mb-1">Phiếu trình sự cố</span>
              <div class="text-xl font-bold text-[#CB997E] font-mono mt-1.5">{{ activeIssues.length }} phiếu</div>
            </div>
            <div class="bg-white p-5 rounded-[24px] border border-[#EAE7E1] shadow-xs">
              <span class="text-[10px] text-[#8B8B8B] font-bold uppercase block mb-1">Số lượng giường trống</span>
              <div class="text-xl font-bold text-[#6B705C] font-mono mt-1.5">{{ totalVacantSlots }} Giường</div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'Sự cố bảo trì'" class="bg-white rounded-[32px] border border-[#EAE7E1] p-8 shadow-sm space-y-6 text-left flex flex-col min-h-[500px]">
          <h3 class="font-serif text-[#4A4A4A] text-lg border-b border-[#EAE7E1] pb-3.5">Quản lý sự cố kỹ thuật</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs md:text-sm flex-1">
            <div v-for="issue in pIssues" :key="issue.id" class="p-5 border border-[#EAE7E1] bg-[#FDFBF7]/35 rounded-2xl space-y-3 flex flex-col justify-between">
              <div>
                <div class="flex justify-between items-baseline mb-2 bg-[#FDFBF7] border border-[#EAE7E1] p-2 rounded-xl">
                  <span class="font-bold text-[#4A4A4A]">Phiếu: {{ issue.id.toString().substring(0,8) }}</span>
                  <span :class="['text-[10px] font-extrabold px-1.5 py-0.5 rounded-lg', issue.priority === 'Critical' ? 'bg-[#CB997E]/20 text-[#CB997E]' : 'bg-[#6B705C]/20 text-[#6B705C]']">
                    {{ issue.priority === 'Critical' ? 'Khẩn cấp' : 'Thường' }}
                  </span>
                </div>
                <h4 class="font-serif text-[#4A4A4A] text-base">Phòng {{ issue.roomNumber }} - {{ issue.title }}</h4>
                <p class="text-xs text-[#8B8B8B] font-light mt-1">{{ issue.description }}</p>
              </div>
              <div class="flex gap-2 pt-2 border-t border-[#EAE7E1] text-xs">
                <button @click="emit('updateMaintenanceStatus', issue.id, 'Resolved'); showToast('Đã đóng hồ sơ bảo trì!', 'success');" class="w-1/2 bg-[#6B705C] hover:bg-[#8B9178] text-white font-bold py-2 rounded-full cursor-pointer text-center">
                  Đã sửa xong
                </button>
                <span class="flex items-center justify-center italic text-[#8B8B8B] text-xs w-1/2 font-mono bg-[#FDFBF7] border border-[#EAE7E1] rounded-full">
                  Trạng thái: {{ issue.status }}
                </span>
              </div>
            </div>
            <div v-if="activeIssues.length === 0" class="col-span-1 md:col-span-2 text-center py-12 text-[#8B8B8B] italic text-xs font-mono">
              Không có sự cố bảo trì nào đang chờ xử lý.
            </div>
          </div>
          <!-- Phân trang Sự cố -->
          <div v-if="activeIssues.length > 0" class="flex justify-between items-center mt-6 pt-4 border-t border-[#EAE7E1]">
            <span class="text-xs text-[#8B8B8B]">Trang {{ cpIssues }} / {{ tpIssues }}</span>
            <div class="flex gap-2">
              <button @click="ppIssues" :disabled="cpIssues === 1" class="px-3 py-1.5 bg-[#FDFBF7] border border-[#EAE7E1] rounded-lg text-xs font-bold text-[#4A4A4A] disabled:opacity-50 hover:bg-white transition-colors">Trước</button>
              <button @click="npIssues" :disabled="cpIssues === tpIssues" class="px-3 py-1.5 bg-[#FDFBF7] border border-[#EAE7E1] rounded-lg text-xs font-bold text-[#4A4A4A] disabled:opacity-50 hover:bg-white transition-colors">Sau</button>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'Khởi tạo hóa đơn'" class="bg-white rounded-[32px] border border-[#EAE7E1] p-8 shadow-sm text-left">
          <h3 class="font-serif text-[#4A4A4A] text-lg mb-2">Đăng kí ghi điện nước & Phát hành hóa đơn phí</h3>
          <form @submit.prevent="handleCreateBill" class="space-y-4 max-w-lg mt-6">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-xs font-bold text-[#4A4A4A]">Chọn phòng phát hành hóa đơn <span class="text-[#CB997E]">*</span></label>
                <select v-model="billRoom" class="w-full bg-[#FDFBF7] border border-[#EAE7E1] focus:border-[#6B705C] rounded-2xl px-4 py-2.5 text-xs font-mono font-bold outline-none">
                  <option value="101-Tòa B">Phòng 101-Tòa B</option>
                  <option value="A102 - Tòa A">Phòng A102-Tòa A</option>
                </select>
              </div>
              <div class="space-y-1">
                <label class="text-xs font-bold text-[#4A4A4A]">Tháng lập biên lai <span class="text-[#CB997E]">*</span></label>
                <input type="text" v-model="billMonth" class="w-full bg-[#FDFBF7] border border-[#EAE7E1] focus:border-[#6B705C] rounded-2xl px-4 py-2.5 text-xs font-semibold outline-none" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-xs font-bold text-[#4A4A4A]">Chọn mục thu phí</label>
                <select v-model="billType" class="w-full bg-[#FDFBF7] border border-[#EAE7E1] focus:border-[#6B705C] rounded-2xl px-4 py-2.5 text-xs outline-none">
                  <option value="Điện nước">Chỉ số điện nước tiêu dùng</option>
                  <option value="Phí dịch vụ">Gói vệ sinh & dọn rác chung</option>
                </select>
              </div>
              <div class="space-y-1">
                <label class="text-xs font-bold text-[#4A4A4A]">Mức tiền thu (VNĐ) <span className="text-[#CB997E]">*</span></label>
                <input type="number" required v-model="billAmount" placeholder="Ví dụ: 185000" class="w-full bg-[#FDFBF7] border border-[#EAE7E1] focus:border-[#6B705C] rounded-2xl px-4 py-2.5 text-xs font-mono font-bold outline-none" />
              </div>
            </div>
            <button type="submit" class="px-6 py-3 bg-[#6B705C] hover:bg-[#8B9178] text-white font-serif font-light text-xs rounded-full shadow-xs cursor-pointer flex items-center gap-1.5">
              <FilePlus class="w-4 h-4" /> <span>Phát hành hóa đơn trực tuyến</span>
            </button>
          </form>
        </div>

      </div>
    </main>
  </div>
</template>