<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Home, ClipboardList, BedDouble, Receipt, Wrench, BellRing, LogOut, Settings2, Sparkles, Send, CheckCircle2, ShieldAlert, Landmark, UserMinus, CheckCircle, Info, AlertTriangle, Star } from 'lucide-vue-next';
import type { MaintenanceRequest, Invoice, TransferRequest, Room } from '../types';
import { useAppData } from '../composables/useAppData';
import { useRouter } from 'vue-router';

const router = useRouter();
// ============ USE TYPE-SAFE APP DATA & ACTIONS ============
const { user, rooms, invoices, maintenanceRequests, transfers, applications, actions, apiError, isLoading } = useAppData();

const activeTab = ref('Trang chủ');
const toast = ref<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

// ============ COMPUTED WITH SAFE ACCESS ============
/**
 * Student user info from global state with safe defaults
 * Field mapping: user.id (MSSV), user.name (Họ tên), user.roomNumber (Phòng hiện tại)
 */
const studentUser = computed(() => {
  return {
    id: user.value?.id ?? 'N/A',
    name: user.value?.name ?? 'Sinh viên',
    className: user.value?.className ?? 'CNTT-K15',
    phone: user.value?.phone ?? '0978.112.551',
    email: user.value?.email ?? 'hungnguyen@dainam.edu.vn',
    roomNumber: user.value?.roomNumber ?? null,
  };
});

/**
 * All available rooms (Danh sách phòng của toàn KTX)
 * Field mapping: room.roomNumber (Số phòng), room.building (Tòa), room.capacity (Sức chứa)
 */
const roomsList = computed(() => rooms.value ?? []);

/**
 * All maintenance requests from KTX system
 * Field mapping: req.roomNumber (Số phòng), req.status (Trạng thái), req.priority (Mức độ)
 */
const myMaintenance = computed<MaintenanceRequest[]>(() => {
  const roomNumber = studentUser.value?.roomNumber;
  if (!roomNumber) return [];
  // Lọc theo phòng và đảo ngược để phiếu mới lên đầu (Task 2.2)
  const list = maintenanceRequests.value?.filter((req) => req?.roomNumber?.includes(roomNumber)) ?? [];
  return [...list].reverse();
});

/**
 * Student's invoices from API
 */
const myInvoices = ref<Invoice[]>([]);

/**
 * Current room assignment info fetched from API
 */
const studentCode = 'SV202601'; // Đã đổi sang SV202601 để khớp dữ liệu thật của Backend N2
const myApplication = computed(() => {
  const studentId = studentUser.value?.id;
  if (!studentId || studentId === 'N/A') return null;
  return applications.value?.find((app: any) => app.studentId === studentId) || null;
});

const myRoom = ref<any>(null);

import { roomBuildingApi } from '../services/room-building.service';
import { billingApi } from '../services/billing.service';

const fetchMyInvoices = async () => {
  const studentId = studentUser.value?.id;
  if (!studentId || studentId === 'N/A') return;
  try {
    const data = await billingApi.invoices.getByStudent(studentId);
    myInvoices.value = data || [];
  } catch(e) {
    console.error('Lỗi tải hóa đơn:', e);
  }
};

onMounted(async () => {
  fetchMyInvoices();
  const studentId = studentUser.value?.id;
  if (studentId && studentId !== 'N/A') {
    try {
      const res = await roomBuildingApi.rooms.getMyRoom(studentId);
      if (res) {
        myRoom.value = res;
      }
    } catch (e) {
      console.error('Không tải được thông tin phòng:', e);
    }
  }
});

import { watchEffect } from 'vue';

watchEffect(() => {
  if (!myRoom.value && myApplication.value && myApplication.value.status === 'Approved') {
    // Attempt to find the real room in global state
    const requestedRoomNum = String(myApplication.value.roomNumber || '');
    const realRoom = rooms.value?.find((r: any) => String(r.roomNumber) === requestedRoomNum);
    
    let capacity = realRoom ? realRoom.capacity : 4;
    let price = realRoom ? realRoom.price : 800000;
    let roomType = realRoom ? (realRoom.roomType || `Phòng ${capacity} người`) : `Phòng ${capacity} người`;
    let roommatesCount = capacity > 1 ? capacity - 1 : 0;
    
    // In a real scenario, roommates list would come from API. For now, simulate missing slots.
    const fakeRoommates = Array.from({ length: roommatesCount }, (_, i) => i + 1);

    myRoom.value = {
      id: realRoom ? realRoom.id : 1,
      roomNumber: requestedRoomNum,
      buildingName: myApplication.value.building || (realRoom ? realRoom.building : ''),
      roomType: roomType,
      myBed: { bedName: 'Giường số 1' },
      roommates: fakeRoommates,
      price: price,
      amenities: realRoom ? realRoom.amenities : []
    };
  }
});

// Student contact info with safe defaults
const phone = computed(() => studentUser.value?.phone ?? '0978.112.551');
const email = computed(() => studentUser.value?.email ?? 'hungnguyen@dainam.edu.vn');
const className = computed(() => studentUser.value?.className ?? 'CNTT-K15');

// Bổ sung các ref cho tính năng thanh toán gộp và lọc
const filterStatus = ref<'All' | 'Unpaid' | 'Paid'>('All');
const filterMonth = ref<string>('All');
const selectedInvoiceIds = ref<string[]>([]);

const filteredInvoices = computed(() => {
  return myInvoices.value.filter((inv: Invoice) => {
    const matchStatus = filterStatus.value === 'All' ? true : inv.status === filterStatus.value;
    const matchMonth = filterMonth.value === 'All' ? true : inv.month === filterMonth.value;
    return matchStatus && matchMonth;
  });
});

const availableMonths = computed(() => {
  const months = new Set(myInvoices.value.map((inv: Invoice) => inv.month));
  return Array.from(months);
});

// ============ HELPER FUNCTIONS ============
const getInitials = (name?: string) => {
  if (!name) return 'SV';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
  toast.value = { message, type };
  setTimeout(() => { toast.value = null; }, 4000);
};

// ============ UI STATES ============
// Form Báo hỏng
const maintTitle = ref('');
const maintDesc = ref('');
const maintCategory = ref('Điện');
const maintPriority = ref<'Normal' | 'Critical'>('Normal');
const maintImage = ref<File | null>(null);

const handleImageUpload = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    maintImage.value = target.files[0];
  }
};

const viewingMaintenance = ref<MaintenanceRequest | null>(null);
const isMaintModalOpen = ref(false);

const openMaintenanceDetail = (m: MaintenanceRequest) => {
  viewingMaintenance.value = m;
  isMaintModalOpen.value = true;
  isRatingOpen.value = false;
  currentRating.value = 5;
};

const isRatingOpen = ref(false);
const currentRating = ref(5);
const hoverRating = ref(0);

const cancelMaintenance = async () => {
  if (viewingMaintenance.value) {
    try {
      await billingApi.maintenance.updateStatus(viewingMaintenance.value.id, 'Cancelled');
      if (actions?.updateMaintenanceStatus) {
        actions.updateMaintenanceStatus(viewingMaintenance.value.id, 'Cancelled');
      }
      showToast('Đã hủy phiếu yêu cầu sửa chữa thành công.', 'info');
      isMaintModalOpen.value = false;
    } catch (e) {
      showToast('Lỗi khi hủy phiếu!', 'error');
    }
  }
};

const acceptMaintenance = async (isSatisfied: boolean) => {
  if (viewingMaintenance.value) {
    if (isSatisfied) {
      isRatingOpen.value = true;
      return;
    }
    
    const newStatus = 'In Progress';
    try {
      await billingApi.maintenance.updateStatus(viewingMaintenance.value.id, newStatus);
      if (actions?.updateMaintenanceStatus) {
        actions.updateMaintenanceStatus(viewingMaintenance.value.id, newStatus);
      }
      showToast('Đã yêu cầu làm lại!', 'info');
      isMaintModalOpen.value = false;
    } catch (e) {
      showToast('Lỗi khi cập nhật!', 'error');
    }
  }
};

const submitRating = async () => {
  if (viewingMaintenance.value) {
    try {
      // Gọi API Rating ở đây: billingApi.maintenance.rate(viewingMaintenance.value.id, currentRating.value)
      // Tạm thời gọi updateStatus thành Resolved
      await billingApi.maintenance.updateStatus(viewingMaintenance.value.id, 'Resolved');
      if (actions?.updateMaintenanceStatus) {
        actions.updateMaintenanceStatus(viewingMaintenance.value.id, 'Resolved');
      }
      showToast('Đã xác nhận nghiệm thu và đánh giá thợ!', 'success');
      isRatingOpen.value = false;
      isMaintModalOpen.value = false;
    } catch (e) {
      showToast('Lỗi khi gửi đánh giá!', 'error');
    }
  }
};

// Form Chuyển phòng
const requestedRoomCode = ref('');
const transferReason = ref('');

// Thanh toán
const payingInvoice = ref<Invoice | null>(null);
const isPayModalOpen = ref(false);

const handleMaintenanceSubmit = async () => {
  if (!maintTitle.value?.trim() || !maintDesc.value?.trim()) {
    showToast('Vui lòng điền đủ tiêu đề và nội dung mô tả lỗi báo hỏng!', 'error');
    return;
  }

  const formData = new FormData();
  formData.append('roomNumber', myRoom.value ? `${myRoom.value.roomNumber}-${myRoom.value.building || ''}` : studentUser.value.roomNumber || '101');
  formData.append('roomId', myRoom.value?.id?.toString() || '1');
  formData.append('studentId', '1'); // Pass dummy int to satisfy N3 DB schema
  formData.append('title', maintTitle.value);
  formData.append('description', maintDesc.value);
  formData.append('category', maintCategory.value);
  formData.append('priority', maintPriority.value);
  if (maintImage.value) {
    formData.append('image', maintImage.value);
  }

  try {
    const newReq = await billingApi.maintenance.createWithImage(formData);
    showToast('Đã gửi phiếu báo hỏng kỹ thuật thành công tới ban kỹ sư KTX!', 'success');
    maintTitle.value = '';
    maintDesc.value = '';
    maintCategory.value = 'Điện';
    maintPriority.value = 'Normal';
    maintImage.value = null;
    
    // Tải lại list
    if (actions?.addMaintenance) {
       // Mock push since we directly hit API here
       actions.addMaintenance(newReq as any); // Update local state directly
    }
  } catch (error) {
    showToast('Có lỗi xảy ra khi gửi phiếu báo hỏng!', 'error');
  }
};

const handleTransferSubmit = () => {
  if (!requestedRoomCode.value?.trim() || !transferReason.value?.trim()) {
    showToast('Vui lòng chọn phòng mong muốn và ghi đầy đủ lý do nguyện vọng chuyển phòng!', 'error');
    return;
  }

  const newTransfer: TransferRequest = {
    id: 'tf-' + Math.random().toString(36).substr(2, 9),
    studentId: studentUser.value?.id ?? 'N/A',
    fullName: studentUser.value?.name ?? 'Sinh viên',
    currentRoom: myRoom.value ? `${myRoom.value.roomNumber}-${myRoom.value.building || ''}` : studentUser.value.roomNumber || '101',
    requestedRoom: requestedRoomCode.value,
    reason: transferReason.value,
    status: 'Pending',
    createdAt: new Date().toISOString().split('T')[0]
  };

  if (actions?.addTransfer) {
    actions.addTransfer(newTransfer);
  }

  showToast('Đơn đề xuất xin di chuyển phòng ở đã gửi thành công!', 'success');
  requestedRoomCode.value = '';
  transferReason.value = '';
};

const startInvoicePayment = (inv: Invoice) => {
  payingInvoice.value = inv;
  isPayModalOpen.value = true;
};

const startBatchPayment = () => {
  const selected = myInvoices.value.filter((i: Invoice) => selectedInvoiceIds.value.includes(i.id)) || [];
  const totalAmount = selected.reduce((sum: number, i: Invoice) => sum + i.amount, 0);
  payingInvoice.value = {
    id: 'HD-GOP-' + String((myInvoices.value.length || 0) + 1).padStart(3, '0'),
    type: 'Thanh toán gộp ' + selected.length + ' hóa đơn',
    month: filterMonth.value !== 'All' ? filterMonth.value : 'Nhiều tháng',
    amount: totalAmount,
    roomFee: selected.reduce((s: number, i: Invoice) => s + (i.roomFee || 0), 0),
    electricityFee: selected.reduce((s: number, i: Invoice) => s + (i.electricityFee || 0), 0),
    waterFee: selected.reduce((s: number, i: Invoice) => s + (i.waterFee || 0), 0),
    serviceFee: selected.reduce((s: number, i: Invoice) => s + (i.serviceFee || 0), 0),
    status: 'Unpaid',
    roomNumber: selected[0]?.roomNumber || '',
    studentId: selected[0]?.studentId || '',
    createdAt: new Date().toISOString().split('T')[0]
  };
  isPayModalOpen.value = true;
};

const completeInvoicePayment = () => {
  if (!payingInvoice.value) return;
  
  if (payingInvoice.value.id.toString().startsWith('HD-GOP-')) {
    selectedInvoiceIds.value.forEach(id => {
      if (actions?.payInvoice) actions.payInvoice(id);
    });
    selectedInvoiceIds.value = [];
  } else {
    if (actions?.payInvoice) {
      actions.payInvoice(payingInvoice.value.id);
    }
  }

  isPayModalOpen.value = false;
  payingInvoice.value = null;
  showToast('Giao dịch thanh toán hóa đơn đã được ghi nhận thành công!', 'success');
};

const handleProfileSave = () => {
  showToast('Cập nhật thông tin trích lý lịch cá nhân thành công!', 'success');
};

const handleLogout = () => {
  if (actions?.logout) actions.logout();
};

const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN').format(amount ?? 0);

const menuItems = [
  { id: 'Trang chủ', icon: Home },
  { id: 'Phòng của tôi', icon: BedDouble },
  { id: 'Chuyển phòng', icon: UserMinus },
  { id: 'Hợp đồng', icon: ClipboardList },
  { id: 'Thanh toán', icon: Receipt },
  { id: 'Yêu cầu sửa chữa', icon: Wrench },
  { id: 'Thông báo', icon: BellRing },
  { id: 'Hồ sơ cá nhân', icon: Settings2 },
];
</script>

<template>
  <div class="w-full flex bg-background min-h-screen text-left border-t border-border text-text-main">

    <div v-if="toast"
      class="fixed top-5 right-5 z-[200] max-w-sm rounded-[20px] shadow-lg border p-4 flex items-start gap-3 bg-white border-border animate-fade-in">
      <CheckCircle v-if="toast.type === 'success'" class="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
      <AlertTriangle v-if="toast.type === 'error'" class="w-5 h-5 text-secondary shrink-0 mt-0.5" />
      <Info v-if="toast.type === 'info'" class="w-5 h-5 text-primary shrink-0 mt-0.5" />
      <div class="text-xs font-semibold text-text-main leading-relaxed">{{ toast.message }}</div>
    </div>

    <aside
      class="w-64 bg-primary text-slate-100 shrink-0 select-none flex flex-col justify-between border-r border-border p-0">
      <div>
        <div class="p-6 border-b border-white/10 flex items-center gap-3">
          <span
            class="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-white font-serif font-extrabold text-sm">D</span>
          <div>
            <div class="font-serif font-light text-sm text-white tracking-widest uppercase">DNU KTX</div>
            <div class="text-[10px] text-background/85">Sinh viên nội trú</div>
          </div>
        </div>

        <nav class="p-4 space-y-1.5 text-xs">
          <button v-for="tab in menuItems" :key="tab.id" @click="activeTab = tab.id"
            :class="['w-full flex items-center gap-3.5 px-4.5 py-3 rounded-2xl font-semibold cursor-pointer transition-all text-left', activeTab === tab.id ? 'bg-secondary text-white shadow-xs' : 'hover:bg-white/10 text-background/90 hover:text-white']">
            <component :is="tab.icon" class="w-4.5 h-4.5 shrink-0" />
            <span>{{ tab.id }}</span>
          </button>
        </nav>
      </div>

      <div class="p-4 border-t border-white/10">
        <div class="p-3 bg-white/10 rounded-2xl flex items-center gap-3 mb-3">
          <div
            class="w-9 h-9 rounded-full bg-secondary text-white font-extrabold flex items-center justify-center border border-white/10 font-mono text-sm leading-none">
            {{ getInitials(studentUser.name) }}</div>
          <div class="overflow-hidden">
            <div class="font-bold text-xs truncate text-white">{{ studentUser.name }}</div>
            <div class="text-[10px] text-background/80 font-mono">MSSV: {{ studentUser.id }}</div>
          </div>
        </div>
        <button @click="router.push('/')"
          class="w-full py-2.5 bg-white/15 hover:bg-white/20 text-white rounded-full transition-colors font-bold text-xs flex items-center justify-center gap-2 cursor-pointer">
          <Home class="w-4 h-4" /> <span>Quay lại trang chủ</span>
        </button>
      </div>
    </aside>

    <main class="flex-1 flex flex-col min-h-screen overflow-y-auto bg-background">

      <header class="bg-white border-b border-border px-8 py-4.5 flex justify-between items-center shrink-0">
        <div class="text-text-main">
          <span class="text-xs text-text-muted font-light">CỔNG THÀNH VIÊN NỘI TRÚ</span>
          <h2 class="font-serif font-light text-text-main text-lg leading-none mt-1">{{ activeTab }}</h2>
        </div>
        <div class="flex items-center gap-4">
          <div
            class="bg-background border border-border rounded-full px-4 py-1.5 text-xs text-primary font-bold uppercase tracking-wider">
            {{ studentUser.className || 'CNTT-K15' }}
          </div>
          <div
            class="w-10 h-10 rounded-full bg-primary text-white border border-border flex items-center justify-center font-extrabold font-mono shadow-xs text-sm">
            {{ getInitials(studentUser.name) }}</div>
        </div>
      </header>

      <div class="p-8 flex-1">

        <div v-if="activeTab === 'Trang chủ'" class="space-y-6">
          <div class="bg-secondary text-white p-6 rounded-[32px] relative overflow-hidden shadow-sm">
            <div class="absolute right-0 bottom-0 opacity-15 pointer-events-none translate-x-3 translate-y-3">
              <Sparkles class="w-32 h-32" />
            </div>
            <div class="relative z-10 text-left">
              <h3 class="text-xl md:text-2xl font-serif font-light mb-1.5 flex items-center gap-2 text-white">
                Chào ngày mới, {{ studentUser.name }}! 👋
              </h3>
              <p class="text-xs md:text-sm text-white/95 font-light max-w-2xl leading-relaxed">
                Chào mừng bạn đến với văn phòng số hóa Ký túc xá Đại học Đại Nam. Theo dõi lịch hoạt động, thanh toán
                các khoản phí lưu trú trực tuyến chính xác và báo lỗi cơ sở vật chất.
              </p>
            </div>
          </div>

          <div v-if="myApplication && myApplication.status === 'Pending'" class="bg-orange-50 border border-orange-200 text-orange-800 p-5 rounded-[24px] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs mb-6">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                <ClipboardList class="w-6 h-6" />
              </div>
              <div>
                <h4 class="font-bold text-sm text-orange-900">Hồ sơ đăng ký lưu trú đang chờ duyệt</h4>
                <p class="text-xs md:text-sm opacity-90 mt-0.5 leading-relaxed">Bạn đã nộp đơn đăng ký <strong>Phòng {{ myApplication.roomNumber }} - {{ myApplication.building }}</strong>. Vui lòng chờ Ban Quản Lý phê duyệt.</p>
              </div>
            </div>
            <div class="px-4 py-2 bg-orange-100 text-orange-700 text-xs font-bold rounded-full border border-orange-200 whitespace-nowrap shadow-sm">
              Đang xử lý
            </div>
          </div>

          <div v-if="myApplication && myApplication.status === 'Approved'" class="bg-emerald-50 border border-emerald-200 text-emerald-800 p-5 rounded-[24px] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs mb-6">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <CheckCircle class="w-6 h-6" />
              </div>
              <div>
                <h4 class="font-bold text-sm text-emerald-900">Hồ sơ đã được phê duyệt!</h4>
                <p class="text-xs md:text-sm opacity-90 mt-0.5 leading-relaxed">Ban quản lý đã duyệt yêu cầu xếp phòng của bạn. Bạn có thể xem chi tiết ở mục <strong>Phòng của tôi</strong>.</p>
              </div>
            </div>
            <div class="px-4 py-2 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200 whitespace-nowrap shadow-sm">
              Đã duyệt
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white p-5 rounded-[24px] border border-border shadow-xs flex items-center gap-4 hover:border-primary/30 transition-colors">
              <div class="w-12 h-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
                <BedDouble class="w-6 h-6" />
              </div>
              <div>
                <div class="text-[10px] text-text-muted font-bold uppercase tracking-wider">Phòng nội trú</div>
                <div class="text-lg font-bold text-text-main font-mono mt-0.5">{{ myRoom ? `${myRoom.roomNumber} (${myRoom.building || myRoom.buildingName})` : 'Chưa xếp' }}</div>
              </div>
            </div>

            <div class="bg-white p-5 rounded-[24px] border border-border shadow-xs flex items-center gap-4 hover:border-secondary/30 transition-colors cursor-pointer" @click="activeTab = 'Thanh toán'">
              <div class="w-12 h-12 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center shrink-0">
                <Receipt class="w-6 h-6" />
              </div>
              <div>
                <div class="text-[10px] text-text-muted font-bold uppercase tracking-wider">Hóa đơn chờ thanh toán</div>
                <div class="text-lg font-bold text-secondary font-mono mt-0.5">{{ myInvoices.filter(i => i.status === 'Unpaid').length }} hóa đơn</div>
              </div>
            </div>

            <div class="bg-white p-5 rounded-[24px] border border-border shadow-xs flex items-center gap-4 hover:border-primary/30 transition-colors cursor-pointer" @click="activeTab = 'Yêu cầu sửa chữa'">
              <div class="w-12 h-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
                <Wrench class="w-6 h-6" />
              </div>
              <div>
                <div class="text-[10px] text-text-muted font-bold uppercase tracking-wider">Sự cố chờ xử lý</div>
                <div class="text-lg font-bold text-text-main font-mono mt-0.5">{{ myMaintenance.filter(m => m.status !== 'Resolved').length }} phiếu</div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'Phòng của tôi'"
          class="bg-white rounded-[32px] border border-border p-8 shadow-sm space-y-6">
          <div class="border-b border-border pb-4 flex justify-between items-baseline">
            <h3 class="font-serif text-text-main text-lg">Hồ sơ chi tiết phòng ở sinh viên</h3>
            <span class="text-xs text-text-muted font-mono">ID: {{ myRoom ? myRoom.id : 'N/A' }}</span>
          </div>

          <div v-if="myRoom" class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-background p-4 rounded-2xl border border-border">
                  <span class="text-[10px] text-text-muted uppercase font-bold">Số phòng ngủ</span>
                  <div class="text-lg font-bold text-text-main font-mono mt-1">Phòng {{ myRoom.roomNumber }}</div>
                </div>
                <div class="bg-background p-4 rounded-2xl border border-border">
                  <span class="text-[10px] text-text-muted uppercase font-bold">Thuộc phân khu</span>
                  <div class="text-lg font-bold text-text-main mt-1">{{ myRoom.building || myRoom.buildingName }}</div>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-background p-4 rounded-2xl border border-border">
                  <span class="text-[10px] text-text-muted uppercase font-bold">Vị trí giường</span>
                  <div class="text-lg font-bold text-text-main font-mono mt-1">{{ myRoom.myBed ? myRoom.myBed.bedName : 'N/A' }}</div>
                </div>
                <div class="bg-background p-4 rounded-2xl border border-border">
                  <span class="text-[10px] text-text-muted uppercase font-bold">Bạn cùng phòng</span>
                  <div class="text-lg font-bold text-text-main mt-1">{{ myRoom.roommates ? myRoom.roommates.length : 0 }} người</div>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-background p-4 rounded-2xl border border-border">
                  <span class="text-[10px] text-text-muted uppercase font-bold">Loại phòng</span>
                  <div class="text-lg font-bold text-text-main mt-1">{{ myRoom.roomType }}</div>
                </div>
                <div class="bg-secondary/10 p-4 rounded-2xl border border-secondary/20">
                  <span class="text-[10px] text-secondary uppercase font-bold">Giá phòng / Tháng</span>
                  <div class="text-lg font-bold text-secondary font-mono mt-1">{{ myRoom.price ? new Intl.NumberFormat('vi-VN').format(myRoom.price) : 0 }}đ</div>
                </div>
              </div>
            </div>
            <div class="space-y-4">
              <h4 class="font-serif text-text-main text-sm">Ảnh phòng mẫu đại diện</h4>
              <div class="rounded-[24px] overflow-hidden shadow-xs border border-border aspect-video">
                <img src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&q=80"
                  referrerpolicy="no-referrer" alt="My Room View" class="w-full h-full object-cover" />
              </div>
            </div>
          </div>
          <div v-else class="text-center py-12 text-text-muted italic">Bạn chưa được sắp phòng chính thức từ văn phòng KTX.</div>
        </div>

        <div v-if="activeTab === 'Thanh toán'" class="bg-white rounded-[32px] border border-border p-8 shadow-sm space-y-6 text-left">
          <div class="flex justify-between items-end border-b border-border pb-4">
            <div>
              <h3 class="font-serif text-text-main text-lg">Hóa đơn điện tử & Thanh toán</h3>
              <p class="text-xs text-text-muted font-light mt-1">Quản lý và thanh toán các khoản phí lưu trú, điện nước</p>
            </div>
            <div class="flex items-center gap-2">
              <select v-model="filterMonth" class="px-4 py-1.5 text-xs font-bold rounded-full bg-background border border-border text-text-main outline-none cursor-pointer">
                <option value="All">Tất cả tháng</option>
                <option v-for="m in availableMonths" :key="m" :value="m">Tháng {{ m }}</option>
              </select>
              <button @click="filterStatus = 'All'" :class="['px-4 py-1.5 text-xs font-bold rounded-full transition-colors cursor-pointer', filterStatus === 'All' ? 'bg-secondary text-white' : 'bg-background border border-border text-text-muted hover:bg-white']">Tất cả</button>
              <button @click="filterStatus = 'Unpaid'" :class="['px-4 py-1.5 text-xs font-bold rounded-full transition-colors cursor-pointer', filterStatus === 'Unpaid' ? 'bg-secondary text-white' : 'bg-background border border-border text-text-muted hover:bg-white']">Chưa thanh toán</button>
              <button @click="filterStatus = 'Paid'" :class="['px-4 py-1.5 text-xs font-bold rounded-full transition-colors cursor-pointer', filterStatus === 'Paid' ? 'bg-secondary text-white' : 'bg-background border border-border text-text-muted hover:bg-white']">Đã thanh toán</button>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-secondary/10 border border-secondary/20 p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span class="text-[10px] text-secondary font-bold uppercase tracking-wider block mb-1">Tổng công nợ cần đóng</span>
                <div class="text-2xl font-bold text-secondary font-mono">{{ formatCurrency(myInvoices.filter(i => i.status === 'Unpaid').reduce((sum, i) => sum + i.amount, 0)) }}đ</div>
              </div>
              <div class="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
                <AlertTriangle class="w-5 h-5" />
              </div>
            </div>
            <div class="bg-primary/10 border border-primary/20 p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span class="text-[10px] text-primary font-bold uppercase tracking-wider block mb-1">Đã thanh toán (Tháng này)</span>
                <div class="text-2xl font-bold text-primary font-mono">{{ myInvoices.filter(i => i.status === 'Paid').length }} Phiếu</div>
              </div>
              <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <CheckCircle2 class="w-5 h-5" />
              </div>
            </div>
          </div>

          <div class="space-y-4 mt-6">
            <div v-for="inv in filteredInvoices" :key="inv.id" class="p-5 border border-border bg-background/35 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-sm transition-shadow">
              <div class="flex items-center gap-4">
                <div v-if="inv.status === 'Unpaid'" class="shrink-0 flex items-center">
                  <input type="checkbox" :value="inv.id" v-model="selectedInvoiceIds" class="w-5 h-5 accent-secondary cursor-pointer rounded-md border-border" />
                </div>
                <div :class="['w-12 h-12 rounded-full flex items-center justify-center shrink-0', inv.status === 'Paid' ? 'bg-primary/15 text-primary' : 'bg-secondary/15 text-secondary']">
                  <Receipt class="w-6 h-6" />
                </div>
                <div>
                  <h4 class="font-bold text-text-main text-base">{{ inv.type }}</h4>
                  <p class="text-xs text-text-muted font-mono mt-1">Phòng: {{ inv.roomNumber }} • Hóa đơn: {{ inv.id }}</p>
                </div>
              </div>
              <div class="flex flex-col items-end gap-2 shrink-0">
                <div class="text-lg font-bold font-mono text-text-main">{{ formatCurrency(inv.amount) }}đ</div>
                <div v-if="inv.status === 'Paid'" class="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold uppercase tracking-wider rounded-md flex items-center gap-1">
                  <CheckCircle2 class="w-3 h-3" /> Đã thu
                </div>
                <button v-else @click="startInvoicePayment(inv)" class="px-5 py-2 bg-secondary hover:bg-[#b07d62] text-white font-bold text-xs rounded-full shadow-xs cursor-pointer">
                  Thanh toán ngay
                </button>
              </div>
            </div>
            <div v-if="filteredInvoices.length === 0" class="text-center py-12 text-text-muted italic text-xs font-mono">Không có hóa đơn nào phù hợp.</div>
          </div>

          <!-- Batch Payment Sticky Bar -->
          <div v-if="selectedInvoiceIds.length > 0" class="sticky bottom-4 left-0 right-0 mt-8 bg-text-main rounded-2xl p-4 shadow-xl flex items-center justify-between text-white animate-fade-in z-50">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <CheckCircle2 class="w-5 h-5 text-white" />
              </div>
              <div>
                <div class="text-[10px] text-text-muted font-bold uppercase tracking-wider">Đang chọn {{ selectedInvoiceIds.length }} hóa đơn</div>
                <div class="font-bold font-mono text-lg">{{ formatCurrency(myInvoices.filter(i => selectedInvoiceIds.includes(i.id)).reduce((s, i) => s + i.amount, 0)) }}đ</div>
              </div>
            </div>
            <button @click="startBatchPayment" class="px-6 py-2.5 bg-secondary hover:bg-[#b07d62] font-bold text-sm rounded-full shadow-md cursor-pointer transition-colors">
              Thanh toán gộp
            </button>
          </div>
        </div>

        <div v-if="activeTab === 'Yêu cầu sửa chữa'" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 bg-white rounded-[32px] border border-border p-8 shadow-sm">
            <h3 class="font-serif text-text-main text-lg mb-2">Báo cáo sự cố cơ sở vật chất & Điện Nước</h3>
            <form @submit.prevent="handleMaintenanceSubmit" class="space-y-4 mt-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-xs font-bold text-text-main">Phát hiện lỗi gì? <span
                      class="text-secondary">*</span></label>
                  <input type="text" required v-model="maintTitle" placeholder="Rò nước vòi sen..."
                    class="w-full bg-background border border-border rounded-2xl px-4 py-2.5 text-xs outline-none focus:border-primary transition-all" />
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-text-main">Phân loại lỗi</label>
                    <select v-model="maintCategory"
                      class="w-full bg-background border border-border rounded-2xl px-2 py-2.5 text-xs outline-none focus:border-primary">
                      <option value="Điện">Điện sinh hoạt</option>
                      <option value="Nước">Đường ống nước</option>
                      <option value="Thiết bị">Đồ nội thất</option>
                    </select>
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-text-main">Mức yêu cầu gấp</label>
                    <select v-model="maintPriority"
                      class="w-full bg-background border border-border rounded-2xl px-2 py-2.5 text-xs outline-none focus:border-primary">
                      <option value="Normal">Thông thường</option>
                      <option value="Critical">Khẩn cấp</option>
                    </select>
                  </div>
                </div>
              </div>
              <div class="space-y-1">
                <label class="text-xs font-bold text-text-main">Mô tả thực trạng <span
                    class="text-secondary">*</span></label>
                <textarea required rows="3" v-model="maintDesc" placeholder="Mô tả cụ thể hiện trạng hư hỏng..."
                  class="w-full bg-background border border-border rounded-2xl px-4 py-3 text-xs outline-none focus:border-primary resize-none transition-all"></textarea>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-xs font-bold text-text-main">Hình ảnh đính kèm (nếu có)</label>
                  <label class="w-full border-2 border-dashed border-border bg-background rounded-2xl px-4 py-2.5 text-xs text-center text-text-muted cursor-pointer hover:border-primary transition-colors flex items-center justify-center gap-2 overflow-hidden">
                    <Sparkles v-if="!maintImage" class="w-4 h-4 shrink-0" />
                    <span class="truncate">{{ maintImage ? maintImage.name : 'Bấm để tải ảnh lên' }}</span>
                    <input type="file" accept="image/*" class="hidden" @change="handleImageUpload" />
                  </label>
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-bold text-text-main">Thời gian bạn rảnh ở phòng</label>
                  <select class="w-full bg-background border border-border rounded-2xl px-4 py-2.5 text-xs outline-none focus:border-primary">
                    <option>Sáng (8h - 11h30)</option>
                    <option>Chiều (14h - 17h30)</option>
                    <option>Tối (Sau 18h)</option>
                  </select>
                </div>
              </div>
              <button type="submit"
                class="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white font-serif font-light text-xs rounded-full shadow-xs flex items-center gap-2 cursor-pointer">
                <span>Gửi báo kỹ thuật KTX</span>
                <Wrench class="w-4.5 h-4.5" />
              </button>
            </form>
          </div>

          <div class="bg-white rounded-[32px] border border-border p-6 shadow-sm flex flex-col max-h-[600px]">
            <div class="border-b border-border pb-3 mb-4">
              <h4 class="font-serif text-text-main text-sm">Các phiếu báo kỹ thuật đã gửi</h4>
              <div class="flex gap-3 mt-2 text-[10px] font-bold">
                <span class="text-secondary">{{ myMaintenance.filter(m => m.status === 'Pending').length }} chờ xử lý</span>
                <span class="text-primary">{{ myMaintenance.filter(m => m.status === 'In Progress').length }} đang sửa</span>
                <span class="text-emerald-600">{{ myMaintenance.filter(m => m.status === 'Resolved').length }} hoàn thành</span>
              </div>
            </div>
            <div v-if="myMaintenance.length > 0" class="space-y-3.5 overflow-y-auto pr-2 custom-scrollbar">
              <div v-for="m in myMaintenance" :key="m.id" @click="openMaintenanceDetail(m)"
                class="p-3.5 border border-border rounded-2xl space-y-2 text-xs bg-background cursor-pointer hover:shadow-md hover:border-secondary/50 transition-all">
                <div class="flex justify-between items-start gap-2 font-bold">
                  <span class="text-text-main line-clamp-2 flex-1">Phiếu {{ m.displayId || m.id }} - {{ m.title }}</span>
                  <span
                    :class="['px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase border shrink-0', 
                      m.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                      m.status === 'Waiting for Acceptance' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                      m.status === 'In Progress' ? 'bg-primary/10 text-primary border-primary/20' : 
                      m.status === 'Cancelled' ? 'bg-gray-100 text-gray-500 border-gray-200' :
                      'bg-secondary/10 text-secondary border-secondary/20']">
                    {{ m.status === 'Pending' ? 'Chờ xử lý' : (m.status === 'In Progress' ? 'Đang sửa' : m.status === 'Waiting for Acceptance' ? 'Chờ nghiệm thu' : m.status === 'Resolved' ? 'Đã xong' : 'Đã hủy') }}
                  </span>
                </div>
                <p class="text-text-muted font-light leading-relaxed truncate">{{ m.description }}</p>
                <div class="text-[10px] text-text-muted font-mono">Gửi: {{ m.createdAt }}</div>
              </div>
            </div>
            <div v-else class="text-center py-12 text-text-muted text-xs italic font-light">Chưa gửi báo hỏng nào.</div>
          </div>
        </div>

      </div>
    </main>

    <!-- Payment Modal (Task 1.3 & 1.4) -->
    <div v-if="isPayModalOpen && payingInvoice" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-text-main/40 backdrop-blur-sm" @click="isPayModalOpen = false"></div>
      <div class="bg-white rounded-[32px] p-8 max-w-md w-full relative z-10 shadow-2xl border border-border animate-fade-in">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h3 class="font-serif text-text-main text-xl mb-1">Chi tiết hóa đơn</h3>
            <p class="text-[10px] text-text-muted font-mono">Mã phiếu: {{ payingInvoice.id }}</p>
          </div>
          <div class="w-12 h-12 bg-secondary/10 text-secondary rounded-full flex items-center justify-center shrink-0">
            <Receipt class="w-6 h-6" />
          </div>
        </div>
        
        <div class="bg-background border border-border rounded-2xl p-4 mb-6 space-y-3">
          <div class="text-[10px] text-text-muted font-bold uppercase tracking-wider border-b border-border pb-2">{{ payingInvoice.type }}</div>
          
          <div class="flex justify-between items-center text-xs">
            <span class="text-text-muted">Tiền phòng:</span>
            <span class="font-bold font-mono text-text-main">{{ formatCurrency(payingInvoice.roomFee || 0) }}đ</span>
          </div>
          <div class="flex justify-between items-center text-xs">
            <span class="text-text-muted">Tiền điện:</span>
            <span class="font-bold font-mono text-text-main">{{ formatCurrency(payingInvoice.electricityFee || 0) }}đ</span>
          </div>
          <div class="flex justify-between items-center text-xs">
            <span class="text-text-muted">Tiền nước:</span>
            <span class="font-bold font-mono text-text-main">{{ formatCurrency(payingInvoice.waterFee || 0) }}đ</span>
          </div>
          <div class="flex justify-between items-center text-xs">
            <span class="text-text-muted">Phí dịch vụ (Internet, Rác...):</span>
            <span class="font-bold font-mono text-text-main">{{ formatCurrency(payingInvoice.serviceFee || 0) }}đ</span>
          </div>

          <div class="flex justify-between items-center pt-3 border-t border-border">
            <span class="text-sm font-bold text-text-main">Tổng cộng:</span>
            <span class="text-2xl font-mono font-bold text-secondary">{{ formatCurrency(payingInvoice.amount) }}<span class="text-lg">đ</span></span>
          </div>
        </div>

        <!-- QR Code Thanh toán (Task 1.4) -->
        <div class="flex flex-col items-center mb-6">
          <span class="text-[10px] text-text-muted uppercase font-bold mb-2">Quét mã VietQR để thanh toán nhanh</span>
          <div class="p-2 border-2 border-dashed border-secondary/50 rounded-2xl bg-white">
            <img :src="`https://img.vietqr.io/image/mbbank-0978112551-compact2.jpg?amount=${payingInvoice.amount}&addInfo=Thanh toan HD ${payingInvoice.id}`" alt="VietQR" class="w-40 h-40 object-contain rounded-xl" />
          </div>
        </div>

        <div class="space-y-3">
          <button @click="completeInvoicePayment" class="w-full py-3.5 bg-primary hover:bg-primary-hover text-white font-bold text-sm rounded-full shadow-md cursor-pointer transition-colors flex items-center justify-center gap-2">
            <CheckCircle2 class="w-4 h-4" /> Xác nhận đã chuyển khoản
          </button>
          <button @click="isPayModalOpen = false" class="w-full py-3.5 bg-transparent hover:bg-background text-text-muted font-bold text-sm rounded-full cursor-pointer transition-colors">
            Đóng
          </button>
        </div>
      </div>
    </div>

    <!-- Maintenance Detail Modal (Task 2.3 & 2.4) -->
    <div v-if="isMaintModalOpen && viewingMaintenance" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-text-main/40 backdrop-blur-sm" @click="isMaintModalOpen = false"></div>
      <div class="bg-white rounded-[32px] p-8 max-w-md w-full relative z-10 shadow-2xl border border-border animate-fade-in">
        <div class="flex justify-between items-start mb-6">
          <div class="pr-4">
            <h3 class="font-serif text-text-main text-xl mb-1 leading-tight">{{ viewingMaintenance.title }}</h3>
            <p class="text-[10px] text-text-muted font-mono">Mã phiếu: {{ viewingMaintenance.displayId || viewingMaintenance.id }} • {{ viewingMaintenance.createdAt }}</p>
          </div>
          <div class="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0">
            <Wrench class="w-6 h-6" />
          </div>
        </div>

        <div class="space-y-4 mb-6 text-sm">
          <div class="bg-background p-4 rounded-2xl border border-border space-y-3">
            <div class="flex justify-between items-center border-b border-border pb-2">
              <span class="text-xs text-text-muted font-bold">Trạng thái hiện tại:</span>
              <span :class="['px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase border', 
                  viewingMaintenance.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                  viewingMaintenance.status === 'In Progress' ? 'bg-primary/10 text-primary border-primary/20' : 
                  viewingMaintenance.status === 'Cancelled' ? 'bg-gray-100 text-gray-500 border-gray-200' :
                  'bg-secondary/10 text-secondary border-secondary/20']">
                {{ viewingMaintenance.status === 'Pending' ? 'Chờ Kỹ sư tiếp nhận' : (viewingMaintenance.status === 'In Progress' ? 'Kỹ sư đang sửa' : viewingMaintenance.status === 'Waiting for Acceptance' ? 'Chờ bạn nghiệm thu' : viewingMaintenance.status === 'Resolved' ? 'Đã sửa xong' : 'Đã hủy') }}
              </span>
            </div>
            <div class="flex justify-between items-center text-xs">
              <span class="text-text-muted">Mức độ:</span>
              <span class="font-bold text-text-main">{{ viewingMaintenance.priority === 'Critical' ? 'Khẩn cấp' : 'Thông thường' }}</span>
            </div>
            <div class="flex justify-between items-center text-xs">
              <span class="text-text-muted">Nhóm lỗi:</span>
              <span class="font-bold text-text-main">{{ viewingMaintenance.category }}</span>
            </div>
          </div>

          <div>
            <h4 class="text-xs font-bold text-text-main mb-1">Mô tả thực trạng:</h4>
            <p class="text-text-muted text-xs leading-relaxed">{{ viewingMaintenance.description }}</p>
          </div>

          <div>
            <h4 class="text-xs font-bold text-text-main mb-2">Hình ảnh đính kèm:</h4>
            <div class="rounded-xl overflow-hidden border border-border w-full h-32 bg-gray-100 flex items-center justify-center">
              <!-- Mock Image -->
              <img src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=400&q=80" alt="Mock Error" class="w-full h-full object-cover" />
            </div>
          </div>

          <!-- Thông tin thợ phụ trách (Chỉ hiện nếu đang sửa hoặc đã xong) -->
          <div v-if="viewingMaintenance.status === 'In Progress' || viewingMaintenance.status === 'Resolved'" class="flex items-center gap-3 bg-primary/5 p-3 rounded-xl border border-primary/20">
            <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Tech1" alt="Tech" class="w-full h-full" />
            </div>
            <div class="flex-1">
              <div class="text-xs font-bold text-text-main">Trần Văn Thợ (Kỹ sư Điện)</div>
              <div class="text-[10px] text-text-muted">SĐT: 0988.xxx.xxx</div>
            </div>
          </div>
          
          <!-- Nghiệm thu (Task 2.5) & Đánh giá (Rating) -->
          <div v-if="viewingMaintenance.status === 'Waiting for Acceptance'" class="bg-blue-50 border border-blue-200 p-4 rounded-xl space-y-3 mt-4">
            <template v-if="!isRatingOpen">
              <h4 class="font-bold text-blue-800 text-sm flex items-center gap-2"><CheckCircle class="w-4 h-4" /> Kỹ sư báo cáo đã sửa xong!</h4>
              <p class="text-xs text-blue-700 leading-relaxed">Vui lòng kiểm tra lại thực tế tại phòng. Lỗi đã được khắc phục hoàn toàn chưa?</p>
              <div class="flex gap-3 pt-2">
                <button @click="acceptMaintenance(true)" class="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer">
                  Hài lòng (Đóng phiếu)
                </button>
                <button @click="acceptMaintenance(false)" class="flex-1 py-2.5 bg-white border border-blue-200 hover:bg-blue-50 text-blue-700 font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer">
                  Vẫn hỏng (Sửa lại)
                </button>
              </div>
            </template>
            <template v-else>
              <h4 class="font-bold text-blue-800 text-sm text-center">Đánh giá chất lượng sửa chữa</h4>
              <p class="text-xs text-blue-700 text-center">Mức độ hài lòng của bạn về thợ kỹ thuật?</p>
              <div class="flex justify-center gap-2 py-4">
                <Star 
                  v-for="star in 5" :key="star" 
                  @click="currentRating = star"
                  @mouseenter="hoverRating = star"
                  @mouseleave="hoverRating = 0"
                  :class="[
                    'w-8 h-8 cursor-pointer transition-colors',
                    star <= (hoverRating || currentRating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
                  ]"
                />
              </div>
              <button @click="submitRating" class="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer">
                Gửi đánh giá & Đóng phiếu
              </button>
            </template>
          </div>
        </div>

        <div class="space-y-3">
          <button v-if="viewingMaintenance.status === 'Pending'" @click="cancelMaintenance" class="w-full py-3.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-sm rounded-full shadow-sm cursor-pointer transition-colors border border-red-200">
            Hủy phiếu yêu cầu
          </button>
          <button @click="isMaintModalOpen = false" class="w-full py-3.5 bg-transparent hover:bg-background text-text-muted font-bold text-sm rounded-full cursor-pointer transition-colors">
            Đóng
          </button>
        </div>
      </div>
    </div>

  </div>
</template>