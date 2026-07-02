<script setup lang="ts">
import StaffRoomSearch from './StaffRoomSearch.vue';
import { ref, computed } from 'vue';
import { usePagination } from '../composables/usePagination';
import { LayoutDashboard, Users, UserPlus, Wrench, ShieldAlert, CheckCircle, LogOut, Search, Building, Receipt, FilePlus, AlertTriangle, Info, CheckCircle2, Landmark } from 'lucide-vue-next';
import type { Room, BookingApplication, MaintenanceRequest, Invoice } from '../types';
import { useAppData } from '../composables/useAppData';
import StaffUtilities from './StaffUtilities.vue';
import { billingApi } from '../services/billing.service';

const { user, rooms: _rooms, applications: _applications, maintenanceRequests: _maintenanceRequests, invoices: _invoices, actions } = useAppData();

const staffUser = computed(() => user.value || { name: 'Cán bộ', id: 'N/A' });

const props = {
  get rooms() { return _rooms.value || []; },
  get applications() { return _applications.value || []; },
  get maintenanceRequests() { return _maintenanceRequests.value || []; },
  get invoices() { return _invoices.value || []; }
};

const emit = (event: string, ...args: any[]) => {
  if (event === 'logout') actions.logout();
  if (event === 'approveApplication') actions.approveApplication(args[0]);
  if (event === 'rejectApplication') actions.rejectApplication(args[0]);
  if (event === 'updateMaintenanceStatus') actions.updateMaintenanceStatus(args[0], args[1]);
  if (event === 'addInvoice') actions.addInvoice(args[0]);
  if (event === 'payInvoice') actions.payInvoice(args[0]);
};

const activeTab = ref<any>('Tổng quan');
const searchQuery = ref('');
const toast = ref<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

// Form Lập hóa đơn phát sinh lẻ
const billRoom = ref('');
const billReason = ref('Phạt vi phạm');
const billDesc = ref('');
const billAmount = ref('');

const extraInvoices = computed(() => {
  return props.invoices
    .filter(i => i.type === 'EXTRA_FEE')
    .sort((a, b) => b.id.localeCompare(a.id));
});

const searchInvoice = ref('');
const unpaidInvoices = computed(() => {
  return props.invoices.filter(i => 
    i.status === 'Unpaid' && 
    ((i.roomNumber || '').toLowerCase().includes(searchInvoice.value.toLowerCase()) || 
     (i.studentId || '').toLowerCase().includes(searchInvoice.value.toLowerCase()))
  );
});

const pendingApps = computed(() => props.applications.filter(a => a.status === 'Pending'));

const searchRoomIssue = ref('');
const showAssignModal = ref(false);
const showRejectModal = ref(false);
const selectedIssue = ref<MaintenanceRequest | null>(null);
const selectedTech = ref('tech_1');
const rejectReason = ref('');

const activeIssues = computed(() => {
  const filtered = props.maintenanceRequests.filter(m => 
    m.status !== 'Resolved' && 
    m.status !== 'Cancelled' && 
    m.status !== 'Rejected' && 
    (m.roomNumber || '').toLowerCase().includes(searchRoomIssue.value.toLowerCase())
  );
  
  return filtered.sort((a, b) => {
    if (a.priority === 'Critical' && b.priority !== 'Critical') return -1;
    if (a.priority !== 'Critical' && b.priority === 'Critical') return 1;
    return b.id.localeCompare(a.id);
  });
});
const urgentIssues = computed(() => activeIssues.value.filter(i => i.priority === 'Critical'));

const { paginatedItems: pIssues, currentPage: cpIssues, totalPages: tpIssues, nextPage: npIssues, prevPage: ppIssues } = usePagination(activeIssues, 4);

const openAssignModal = (issue: MaintenanceRequest) => {
  selectedIssue.value = issue;
  selectedTech.value = 'tech_1';
  showAssignModal.value = true;
};

const openRejectModal = (issue: MaintenanceRequest) => {
  selectedIssue.value = issue;
  rejectReason.value = '';
  showRejectModal.value = true;
};

const handleAssign = async () => {
  if (selectedIssue.value && selectedTech.value) {
    try {
      // Vì Backend Nhóm 3 (N3) không quản lý bảng Thợ sửa chữa, ta chỉ cập nhật trạng thái
      await billingApi.maintenance.updateStatus(selectedIssue.value.id, 'In Progress');
      emit('updateMaintenanceStatus', selectedIssue.value.id, 'In Progress');
      showToast('Đã phân công thợ thành công!', 'success');
      showAssignModal.value = false;
    } catch (e) {
      showToast('Có lỗi xảy ra khi phân công', 'error');
    }
  }
};

const handleReject = async () => {
  if (selectedIssue.value) {
    if (!rejectReason.value) {
      showToast('Vui lòng nhập lý do từ chối!', 'error');
      return;
    }
    try {
      await billingApi.maintenance.updateStatus(selectedIssue.value.id, 'Rejected');
      emit('updateMaintenanceStatus', selectedIssue.value.id, 'Rejected');
      showToast('Đã từ chối phiếu yêu cầu!', 'info');
      showRejectModal.value = false;
    } catch (e) {
      showToast('Có lỗi xảy ra khi cập nhật trạng thái', 'error');
    }
  }
};

const handleUpdateStatus = async (id: string, status: string, message: string) => {
  try {
    await billingApi.maintenance.updateStatus(id, status);
    emit('updateMaintenanceStatus', id, status);
    showToast(message, 'success');
  } catch (e) {
    showToast('Có lỗi xảy ra khi cập nhật trạng thái', 'error');
  }
};

const totalVacantSlots = computed(() => (props.rooms || []).reduce((accum, r) => accum + (r.available ?? 0), 0));

const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
  toast.value = { message, type };
  setTimeout(() => { toast.value = null; }, 4000);
};

const handleCreateBill = async () => {
  if (!billRoom.value || !billAmount.value || !billDesc.value) {
    showToast('Vui lòng khai báo đầy đủ thông tin (phòng, lý do chi tiết và số tiền)!', 'error');
    return;
  }
  const amt = parseFloat(billAmount.value);
  if (isNaN(amt) || amt <= 0) {
    showToast('Số tiền hóa đơn nhập vào chưa hợp lệ!', 'error');
    return;
  }
  
  try {
    await billingApi.invoices.createExtraFee({
      roomId: parseInt(billRoom.value.split('-')[0]) || 0,
      studentId: 0,
      reason: billReason.value,
      description: billDesc.value,
      amount: amt
    });
    
    showToast('Đã phát hành hóa đơn phát sinh lẻ thành công!', 'success');
    billAmount.value = '';
    billDesc.value = '';
  } catch (error) {
    showToast('Có lỗi xảy ra khi phát hành hóa đơn!', 'error');
  }
};

const menuItems = [
  { id: 'Tổng quan', icon: LayoutDashboard },
  { id: 'Duyệt hồ sơ', icon: UserPlus },
  { id: 'Sự cố bảo trì', icon: Wrench },
  { id: 'Tra cứu Sinh viên', icon: Users },
  { id: 'Tra cứu Phòng', icon: Building },
  { id: 'Lập HD phát sinh lẻ', icon: Receipt },
  { id: 'Ghi nhận thu tiền', icon: Landmark },
  { id: 'Chỉ số Điện Nước', icon: FilePlus }
];
</script>

<template>
  <div class="w-full flex bg-background min-h-screen text-left border-t border-border text-text-main">
    
    <div v-if="toast" class="fixed top-5 right-5 z-[200] max-w-sm rounded-[20px] shadow-lg border p-4 flex items-start gap-3 bg-white border-border animate-fade-in">
      <CheckCircle v-if="toast.type === 'success'" class="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
      <AlertTriangle v-if="toast.type === 'error'" class="w-5 h-5 text-secondary shrink-0 mt-0.5" />
      <Info v-if="toast.type === 'info'" class="w-5 h-5 text-primary shrink-0 mt-0.5" />
      <div class="text-xs font-semibold text-text-main leading-relaxed">{{ toast.message }}</div>
    </div>

    <aside class="w-64 bg-primary text-slate-100 shrink-0 select-none flex flex-col justify-between border-r border-border p-0">
      <div>
        <div class="p-6 border-b border-white/10 flex items-center gap-3">
          <span class="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-white font-serif font-extrabold text-sm">C</span>
          <div>
            <div class="font-serif font-light text-sm text-white tracking-widest uppercase">DNU KTX</div>
            <div class="text-[10px] text-background/85">Phòng trực ban cán bộ</div>
          </div>
        </div>
        <nav class="p-4 space-y-1.5 text-xs">
          <button
            v-for="tab in menuItems"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="['w-full flex items-center gap-3.5 px-4.5 py-3 rounded-2xl font-semibold cursor-pointer transition-all text-left', activeTab === tab.id ? 'bg-secondary text-white shadow-xs' : 'hover:bg-white/10 text-background/85 hover:text-white']"
          >
            <component :is="tab.icon" class="w-4.5 h-4.5 shrink-0" />
            <span>{{ tab.id }}</span>
          </button>
        </nav>
      </div>
      <div class="p-4 border-t border-white/10">
        <div class="p-3 bg-white/15 rounded-2xl flex items-center gap-3 mb-3">
          <div class="w-9 h-9 rounded-full bg-secondary text-white font-extrabold flex items-center justify-center font-mono text-sm">CB</div>
          <div class="overflow-hidden">
            <div class="font-bold text-xs truncate text-white">{{ staffUser.name }}</div>
            <div class="text-[10px] text-background/80">Cán bộ trực ban</div>
          </div>
        </div>
        <button @click="emit('logout')" class="w-full py-2.5 bg-white/15 hover:bg-white/20 text-white rounded-full text-xs font-bold flex items-center justify-center gap-2 cursor-pointer">
          <LogOut class="w-4 h-4" /> <span>Thoát cán bộ</span>
        </button>
      </div>
    </aside>

    <main class="flex-1 flex flex-col min-h-screen overflow-y-auto bg-background">
      <header class="bg-white border-b border-border px-8 py-4.5 flex justify-between items-center shrink-0">
        <div class="text-text-main">
          <span class="text-xs text-text-muted font-light">BẢNG VẬN HÀNH KTX ĐẠI NAM</span>
          <h2 class="font-serif font-light text-text-main text-lg leading-none mt-1">{{ activeTab }}</h2>
        </div>
        <div class="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-full px-4 py-1.5 text-xs font-bold uppercase">Phiên trực: Đang mở ⚡</div>
      </header>

      <div class="p-8 flex-1">
        
        <StaffUtilities v-if="activeTab === 'Chỉ số Điện Nước'" />

        <div v-if="activeTab === 'Tổng quan'" class="space-y-6 animate-fade-in text-left">
          <div v-if="urgentIssues.length > 0" class="bg-secondary/10 border border-secondary/30 p-5 rounded-[24px] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div class="flex items-start gap-4">
              <div class="w-11 h-11 rounded-full bg-secondary/20 text-secondary flex items-center justify-center shrink-0 mt-1">
                <ShieldAlert class="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <span class="text-[10px] bg-secondary text-white font-extrabold uppercase px-2 py-0.5 rounded-md">CẢNH BÁO SỰ CỐ KHẨN</span>
                <h4 class="font-serif font-light text-text-main text-base mt-2">{{ urgentIssues[0].title }}</h4>
                <p class="text-xs text-text-muted font-light mt-1">Mô tả thực trạng: {{ urgentIssues[0].description }} (Vị trí: {{ urgentIssues[0].roomNumber }})</p>
              </div>
            </div>
            <button @click="handleUpdateStatus(urgentIssues[0].id, 'In Progress', 'Đã cử kĩ sư hiện trường!');" class="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-full shadow-xs cursor-pointer">
              Cử kỹ sư xử lý ngay
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="bg-white p-5 rounded-[24px] border border-border shadow-xs hover:border-primary/30 transition-colors cursor-pointer" @click="activeTab = 'Duyệt hồ sơ'">
              <span class="text-[10px] text-text-muted font-bold uppercase block mb-1 tracking-wider">Đơn tuyển ký phòng</span>
              <div class="text-xl font-bold text-text-main font-mono mt-1.5">{{ pendingApps.length }} đơn chờ</div>
            </div>
            <div class="bg-white p-5 rounded-[24px] border border-border shadow-xs hover:border-secondary/30 transition-colors cursor-pointer" @click="activeTab = 'Sự cố bảo trì'">
              <span class="text-[10px] text-text-muted font-bold uppercase block mb-1 tracking-wider">Phiếu trình sự cố</span>
              <div class="text-xl font-bold text-secondary font-mono mt-1.5">{{ activeIssues.length }} phiếu</div>
            </div>
            <div class="bg-white p-5 rounded-[24px] border border-border shadow-xs hover:border-primary/30 transition-colors cursor-pointer" @click="activeTab = 'Tra cứu Phòng'">
              <span class="text-[10px] text-text-muted font-bold uppercase block mb-1 tracking-wider">Lượng giường trống</span>
              <div class="text-xl font-bold text-primary font-mono mt-1.5">{{ totalVacantSlots }} giường</div>
            </div>
            <div class="bg-white p-5 rounded-[24px] border border-border shadow-xs hover:border-secondary/30 transition-colors cursor-pointer" @click="activeTab = 'Ghi nhận thu tiền'">
              <span class="text-[10px] text-text-muted font-bold uppercase block mb-1 tracking-wider">Hóa đơn cần thu</span>
              <div class="text-xl font-bold text-secondary font-mono mt-1.5">{{ props.invoices.filter(i => i.status === 'Unpaid').length }} hóa đơn</div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'Tra cứu Phòng'" class="bg-white rounded-[32px] border border-border p-8 shadow-sm text-left">
          <h3 class="font-serif text-text-main text-lg mb-6">Tra cứu thông tin phòng</h3>
          <StaffRoomSearch />
        </div>

        <div v-if="activeTab === 'Sự cố bảo trì'" class="bg-white rounded-[32px] border border-border p-8 shadow-sm space-y-6 text-left flex flex-col min-h-[500px]">
          <div class="flex justify-between items-center border-b border-border pb-3.5">
            <h3 class="font-serif text-text-main text-lg">Quản lý sự cố kỹ thuật</h3>
            <div class="relative w-64">
              <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type="text" v-model="searchRoomIssue" placeholder="Tìm theo số phòng..." class="w-full bg-background border border-border focus:border-primary rounded-full pl-9 pr-4 py-2 text-xs outline-none" />
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs md:text-sm flex-1">
            <div v-for="issue in pIssues" :key="issue.id" class="p-5 border border-border bg-background/35 rounded-2xl space-y-3 flex flex-col justify-between">
              <div>
                <div class="flex justify-between items-baseline mb-2 bg-background border border-border p-2 rounded-xl">
                  <span class="font-bold text-text-main">Phiếu: {{ issue.displayId || issue.id }}</span>
                  <span :class="['text-[10px] font-extrabold px-1.5 py-0.5 rounded-lg', issue.priority === 'Critical' ? 'bg-secondary/20 text-secondary' : 'bg-primary/20 text-primary']">
                    {{ issue.priority === 'Critical' ? 'Khẩn cấp' : 'Thường' }}
                  </span>
                </div>
                
                <h4 class="font-serif text-text-main text-base">Phòng {{ issue.roomNumber }} - {{ issue.title }}</h4>
                <p class="text-xs text-text-muted font-light mt-1">{{ issue.description }}</p>
              </div>
              
              <div class="flex gap-2 pt-2 border-t border-border text-xs mt-auto">
                <template v-if="issue.status === 'Pending'">
                  <button @click="openAssignModal(issue)" class="w-1/2 bg-secondary hover:bg-[#A47148] text-white font-bold py-2 rounded-full cursor-pointer text-center">
                    Tiếp nhận xử lý
                  </button>
                  <button @click="openRejectModal(issue)" class="w-1/2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold py-2 rounded-full cursor-pointer text-center">
                    Từ chối phiếu
                  </button>
                </template>
                <template v-else-if="issue.status === 'In Progress'">
                  <button @click="handleUpdateStatus(issue.id, 'Waiting for Acceptance', 'Đã báo sinh viên nghiệm thu!');" class="w-1/2 bg-primary hover:bg-primary-hover text-white font-bold py-2 rounded-full cursor-pointer text-center">
                    Báo chờ nghiệm thu
                  </button>
                  <span class="flex items-center justify-center font-bold text-[10px] w-1/2 uppercase tracking-wide border rounded-full bg-primary/10 text-primary border-primary/20">
                    Đang sửa
                  </span>
                </template>
                <template v-else-if="issue.status === 'Waiting for Acceptance'">
                  <span class="flex items-center justify-center font-bold text-[10px] w-full uppercase tracking-wide border rounded-full bg-blue-50 text-blue-700 border-blue-200 py-2">
                    Chờ SV nghiệm thu
                  </span>
                </template>
              </div>
            </div>
            <div v-if="activeIssues.length === 0" class="col-span-1 md:col-span-2 text-center py-12 text-text-muted italic text-xs font-mono">
              Không tìm thấy sự cố bảo trì nào.
            </div>
          </div>
          <div v-if="activeIssues.length > 0" class="flex justify-between items-center mt-6 pt-4 border-t border-border">
            <span class="text-xs text-text-muted">Trang {{ cpIssues }} / {{ tpIssues }}</span>
            <div class="flex gap-2">
              <button @click="ppIssues" :disabled="cpIssues === 1" class="px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-bold text-text-main disabled:opacity-50 hover:bg-white transition-colors">Trước</button>
              <button @click="npIssues" :disabled="cpIssues === tpIssues" class="px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-bold text-text-main disabled:opacity-50 hover:bg-white transition-colors">Sau</button>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'Lập HD phát sinh lẻ'" class="bg-white rounded-[32px] border border-border p-8 shadow-sm text-left">
          <h3 class="font-serif text-text-main text-lg mb-2">Lập hóa đơn phát sinh lẻ</h3>
          <form @submit.prevent="handleCreateBill" class="space-y-4 max-w-lg mt-6">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-xs font-bold text-text-main">Chọn phòng phát hành <span class="text-secondary">*</span></label>
                <select v-model="billRoom" required class="w-full bg-background border border-border focus:border-primary rounded-2xl px-4 py-2.5 text-xs font-mono font-bold outline-none">
                  <option value="" disabled>-- Chọn phòng --</option>
                  <option v-for="room in props.rooms" :key="room.id" :value="room.roomNumber + '-' + room.building">
                    Phòng {{ room.roomNumber }} - Tòa {{ room.building }}
                  </option>
                </select>
              </div>
              <div class="space-y-1">
                <label class="text-xs font-bold text-text-main">Lý do thu <span class="text-secondary">*</span></label>
                <select v-model="billReason" required class="w-full bg-background border border-border focus:border-primary rounded-2xl px-4 py-2.5 text-xs outline-none">
                  <option value="Phạt vi phạm">Phạt vi phạm nội quy</option>
                  <option value="Hỏng đồ">Bồi thường tài sản hỏng</option>
                  <option value="Mất chìa khóa">Làm lại thẻ/chìa khóa</option>
                  <option value="Tiền điện nước">Phụ trội điện nước vượt định mức</option>
                  <option value="Vệ sinh phí">Phí vệ sinh tăng thêm</option>
                  <option value="Khác">Lý do khác...</option>
                </select>
              </div>
            </div>
            <div class="space-y-1">
              <label class="text-xs font-bold text-text-main">Mô tả chi tiết <span class="text-secondary">*</span></label>
              <textarea v-model="billDesc" rows="2" placeholder="Ví dụ: Tiền đền bù giường hỏng do sinh viên..." class="w-full bg-background border border-border focus:border-primary rounded-2xl px-4 py-3 text-xs outline-none resize-none"></textarea>
            </div>
            <div class="space-y-1">
              <label class="text-xs font-bold text-text-main">Mức tiền thu (VNĐ) <span class="text-secondary">*</span></label>
              <input type="number" required v-model="billAmount" placeholder="Ví dụ: 150000" class="w-full bg-background border border-border focus:border-primary rounded-2xl px-4 py-2.5 text-xs font-mono font-bold outline-none" />
            </div>
            <button type="submit" class="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-serif font-light text-xs rounded-full shadow-xs cursor-pointer flex items-center gap-1.5">
              <FilePlus class="w-4 h-4" /> <span>Phát hành hóa đơn</span>
            </button>
          </form>

          <!-- Lịch sử hóa đơn phát sinh lẻ -->
          <div class="mt-10 border-t border-border pt-8">
            <h4 class="font-serif text-text-main text-base mb-4">Lịch sử hóa đơn đã lập</h4>
            <div class="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              <div v-for="inv in extraInvoices" :key="inv.id" class="p-4 border border-border bg-background/50 rounded-2xl flex justify-between items-center hover:border-primary/30 transition-colors">
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <span class="font-bold text-text-main text-sm">Phòng {{ inv.roomNumber }}</span>
                    <span :class="['text-[10px] font-bold px-2 py-0.5 rounded-full', inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-secondary/15 text-secondary']">
                      {{ inv.status === 'Paid' ? 'Đã thu' : 'Chưa thu' }}
                    </span>
                  </div>
                  <p class="text-xs text-text-muted">{{ inv.month }} • Lập ngày: {{ new Date(inv.createdAt).toLocaleDateString('vi-VN') }}</p>
                </div>
                <div class="text-base font-bold font-mono text-text-main">
                  {{ new Intl.NumberFormat('vi-VN').format(inv.amount) }}đ
                </div>
              </div>
              <div v-if="extraInvoices.length === 0" class="text-center py-6 text-text-muted italic text-xs font-mono">
                Chưa có hóa đơn phát sinh nào được lập.
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'Ghi nhận thu tiền'" class="bg-white rounded-[32px] border border-border p-8 shadow-sm text-left">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border pb-3.5 mb-6 gap-4">
            <h3 class="font-serif text-text-main text-lg">Ghi nhận thanh toán & Thu hồi công nợ</h3>
            <div class="relative w-full md:w-72">
              <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type="text" v-model="searchInvoice" placeholder="Tìm theo Mã SV hoặc Số phòng..." class="w-full bg-background border border-border focus:border-primary rounded-full pl-9 pr-4 py-2 text-xs outline-none" />
            </div>
          </div>
          
          <div class="space-y-4">
            <div v-for="inv in unpaidInvoices" :key="inv.id" class="p-5 border border-border bg-background/35 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-secondary/30 transition-colors">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-secondary/15 text-secondary">
                  <Receipt class="w-6 h-6" />
                </div>
                <div>
                  <h4 class="font-bold text-text-main text-base">{{ inv.type === 'EXTRA_FEE' ? 'Hóa đơn phát sinh' : inv.type }} - {{ inv.month }}</h4>
                  <p class="text-xs text-text-muted font-mono mt-1">Phòng: {{ inv.roomNumber }} • MSSV: {{ inv.studentId }} • ID Hóa đơn: {{ inv.id }}</p>
                </div>
              </div>
              <div class="flex flex-col items-end gap-2 shrink-0">
                <div class="text-lg font-bold font-mono text-text-main">{{ new Intl.NumberFormat('vi-VN').format(inv.amount) }}đ</div>
                <button @click="emit('payInvoice', inv.id); showToast('Đã ghi nhận thu Tiền Mặt thành công!', 'success');" class="px-5 py-2 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-full shadow-xs cursor-pointer flex items-center gap-2">
                  <CheckCircle2 class="w-4 h-4" /> Ghi nhận thu Tiền Mặt
                </button>
              </div>
            </div>
            
            <div v-if="unpaidInvoices.length === 0" class="text-center py-12 text-text-muted italic text-xs font-mono">
              Không tìm thấy khoản công nợ nào cần thu phù hợp.
            </div>
          </div>
        </div>

      </div>
    </main>
    <div v-if="showAssignModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-text-main/40 backdrop-blur-sm" @click="showAssignModal = false"></div>
      <div class="bg-white rounded-[32px] p-8 max-w-sm w-full relative z-10 shadow-2xl border border-border animate-fade-in text-left">
        <h3 class="font-serif text-text-main text-lg mb-4">Phân công Thợ sửa chữa</h3>
        <p class="text-xs text-text-muted mb-4">Chọn kỹ sư phụ trách để chuyển phiếu trạng thái In Progress.</p>
        <div class="space-y-4">
          <select v-model="selectedTech" class="w-full bg-background border border-border focus:border-primary rounded-2xl px-4 py-3 text-xs outline-none">
            <option value="tech_1">Trần Văn Thợ - Kỹ sư Điện</option>
            <option value="tech_2">Nguyễn Hữu Nước - Kỹ sư Ống nước</option>
            <option value="tech_3">Lê Quý Mộc - Thợ mộc/Nội thất</option>
          </select>
          <div class="flex gap-2">
            <button @click="handleAssign" class="w-1/2 py-2.5 bg-secondary hover:bg-[#A47148] text-white font-bold text-xs rounded-full cursor-pointer">Phân công</button>
            <button @click="showAssignModal = false" class="w-1/2 py-2.5 bg-background border border-border hover:bg-white text-text-main font-bold text-xs rounded-full cursor-pointer">Hủy</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showRejectModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-text-main/40 backdrop-blur-sm" @click="showRejectModal = false"></div>
      <div class="bg-white rounded-[32px] p-8 max-w-sm w-full relative z-10 shadow-2xl border border-border animate-fade-in text-left">
        <h3 class="font-serif text-red-600 text-lg mb-4">Từ chối phiếu yêu cầu</h3>
        <p class="text-xs text-text-muted mb-4">Nhập lý do từ chối để phản hồi lại cho sinh viên.</p>
        <div class="space-y-4">
          <textarea v-model="rejectReason" rows="3" placeholder="Ví dụ: Vấn đề không thuộc thẩm quyền xử lý..." class="w-full bg-background border border-border focus:border-red-400 rounded-2xl px-4 py-3 text-xs outline-none resize-none"></textarea>
          <div class="flex gap-2">
            <button @click="handleReject" class="w-1/2 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-full cursor-pointer">Xác nhận từ chối</button>
            <button @click="showRejectModal = false" class="w-1/2 py-2.5 bg-background border border-border hover:bg-white text-text-main font-bold text-xs rounded-full cursor-pointer">Hủy</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>