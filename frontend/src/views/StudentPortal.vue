<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import { Home, ClipboardList, BedDouble, Receipt, Wrench, BellRing, LogOut, Settings2, Sparkles, Send, CheckCircle2, ShieldAlert, Landmark, UserMinus, CheckCircle, Info, AlertTriangle } from 'lucide-vue-next';
// Giả định import các type (bạn có thể thay đổi đường dẫn cho khớp)
import type { Room, MaintenanceRequest, Invoice, TransferRequest } from '../types';

const appData: any = inject('appData');
const actions: any = inject('actions');

const emit = defineEmits<{
  (e: 'logout'): void;
  (e: 'addMaintenance', req: MaintenanceRequest): void;
  (e: 'updateMaintenanceStatus', id: string, status: 'Pending' | 'In Progress' | 'Resolved'): void;
  (e: 'payInvoice', invoiceId: string): void;
  (e: 'addTransfer', req: TransferRequest): void;
}>();

const activeTab = ref('Trang chủ');
const toast = ref<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

// Form Sự cố kỹ thuật
const maintTitle = ref('');
const maintCategory = ref('Điện');
const maintPriority = ref<'Critical' | 'Normal'>('Normal');
const maintDesc = ref('');

// Form Chuyển phòng
const requestedRoomCode = ref('');
const transferReason = ref('');

// Thanh toán
const payingInvoice = ref<Invoice | null>(null);
const isPayModalOpen = ref(false);


const studentUser = computed(() => appData?.user?.value || appData?.user || { name: 'Sinh viên', id: 'N/A' });
const rooms = computed(() => appData?.rooms?.value || appData?.rooms || []);
const maintenanceRequests = computed(() => appData?.maintenanceRequests?.value || appData?.maintenanceRequests || []);
const invoices = computed(() => appData?.invoices?.value || appData?.invoices || []);
const transferRequests = computed(() => appData?.transferRequests?.value || appData?.transferRequests || []);

// Sửa lại các ref profile để lấy dữ liệu từ studentUser.value
const phone = computed(() => studentUser.value.phone || '0978.112.551');
const email = computed(() => studentUser.value.email || 'hungnguyen@dainam.edu.vn');
const className = computed(() => studentUser.value.className || 'CNTT-K15');

const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
  toast.value = { message, type };
  setTimeout(() => { toast.value = null; }, 4000);
};

const myRoom = computed(() => {
  return rooms.value.find((r: Room) => r.occupants && r.occupants.includes(studentUser.value.id));
});

const myMaintenance = computed(() => {
  // Vì App.vue đã gọi API lấy đúng danh sách của phòng này rồi nên ta trả về luôn
  return maintenanceRequests.value;
});

const handleMaintenanceSubmit = () => {
  if (!maintTitle.value || !maintDesc.value) {
    showToast('Vui lòng điền đủ tiêu đề và nội dung mô tả lỗi báo hỏng!', 'error');
    return;
  }
  const newRequest: MaintenanceRequest = {
    id: 'maint-' + Math.random().toString(36).substr(2, 9),
    roomNumber: myRoom.value ? `${myRoom.value.roomNumber}-${myRoom.value.building}` : '101-Tòa B',
    title: maintTitle.value,
    description: maintDesc.value,
    category: maintCategory.value as any,
    priority: maintPriority.value,
    status: 'Pending',
    createdAt: new Date().toISOString().split('T')[0]
  };
  
  if (actions && actions.addMaintenance) {
    actions.addMaintenance(newRequest);
  }
  
  showToast('Đã gửi phiếu báo hỏng kỹ thuật thành công tới ban kỹ sư KTX!', 'success');
  maintTitle.value = '';
  maintDesc.value = '';
};

const handleTransferSubmit = () => {
  if (!requestedRoomCode.value || !transferReason.value) {
    showToast('Vui lòng chọn phòng mong muốn và ghi đầy đủ lý do nguyện vọng chuyển phòng!', 'error');
    return;
  }
  const newTransfer: TransferRequest = {
    id: 'tf-' + Math.random().toString(36).substr(2, 9),
    studentId: studentUser.value.id,
    fullName: studentUser.value.name,
    currentRoom: myRoom.value ? `${myRoom.value.roomNumber}-${myRoom.value.building}` : '101-Tòa B',
    requestedRoom: requestedRoomCode.value,
    reason: transferReason.value,
    status: 'Pending',
    createdAt: new Date().toISOString().split('T')[0]
  };
  
  if (actions && actions.addTransfer) {
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

const completeInvoicePayment = () => {
  if (!payingInvoice.value) return;
  
  if (actions && actions.payInvoice) {
    actions.payInvoice(payingInvoice.value.id);
  }

  isPayModalOpen.value = false;
  payingInvoice.value = null;
  showToast('Giao dịch thanh toán hóa đơn đã được ghi nhận thành công!', 'success');
};

const handleProfileSave = () => {
  showToast('Cập nhật thông tin trích lý lịch cá nhân thành công!', 'success');
};

const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN').format(amount);

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
  <div class="w-full flex bg-[#FDFBF7] min-h-screen text-left border-t border-[#EAE7E1] text-[#4A4A4A]">

    <div v-if="toast"
      class="fixed top-5 right-5 z-[200] max-w-sm rounded-[20px] shadow-lg border p-4 flex items-start gap-3 bg-white border-[#EAE7E1] animate-fade-in">
      <CheckCircle v-if="toast.type === 'success'" class="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
      <AlertTriangle v-if="toast.type === 'error'" class="w-5 h-5 text-[#CB997E] shrink-0 mt-0.5" />
      <Info v-if="toast.type === 'info'" class="w-5 h-5 text-[#6B705C] shrink-0 mt-0.5" />
      <div class="text-xs font-semibold text-[#4A4A4A] leading-relaxed">{{ toast.message }}</div>
    </div>

    <aside
      class="w-64 bg-[#6B705C] text-slate-100 shrink-0 select-none flex flex-col justify-between border-r border-[#EAE7E1] p-0">
      <div>
        <div class="p-6 border-b border-white/10 flex items-center gap-3">
          <span
            class="w-8 h-8 rounded-xl bg-[#CB997E] flex items-center justify-center text-white font-serif font-extrabold text-sm">D</span>
          <div>
            <div class="font-serif font-light text-sm text-white tracking-widest uppercase">DNU KTX</div>
            <div class="text-[10px] text-[#FDFBF7]/85">Sinh viên nội trú</div>
          </div>
        </div>

        <nav class="p-4 space-y-1.5 text-xs">
          <button v-for="tab in menuItems" :key="tab.id" @click="activeTab = tab.id"
            :class="['w-full flex items-center gap-3.5 px-4.5 py-3 rounded-2xl font-semibold cursor-pointer transition-all text-left', activeTab === tab.id ? 'bg-[#CB997E] text-white shadow-xs' : 'hover:bg-white/10 text-[#FDFBF7]/90 hover:text-white']">
            <component :is="tab.icon" class="w-4.5 h-4.5 shrink-0" />
            <span>{{ tab.id }}</span>
          </button>
        </nav>
      </div>

      <div class="p-4 border-t border-white/10">
        <div class="p-3 bg-white/10 rounded-2xl flex items-center gap-3 mb-3">
          <div
            class="w-9 h-9 rounded-full bg-[#CB997E] text-white font-extrabold flex items-center justify-center border border-white/10 font-mono text-sm leading-none">
            SV</div>
          <div class="overflow-hidden">
            <div class="font-bold text-xs truncate text-white">{{ studentUser.name }}</div>
            <div class="text-[10px] text-[#FDFBF7]/80 font-mono">MSSV: {{ studentUser.id }}</div>
          </div>
        </div>
        <button @click="actions.logout()"
          class="w-full py-2.5 bg-white/15 hover:bg-white/20 text-white rounded-full transition-colors font-bold text-xs flex items-center justify-center gap-2 cursor-pointer">
          <LogOut class="w-4 h-4" /> <span>Thoát cổng sinh viên</span>
        </button>
      </div>
    </aside>

    <main class="flex-1 flex flex-col min-h-screen overflow-y-auto bg-[#FDFBF7]">

      <header class="bg-white border-b border-[#EAE7E1] px-8 py-4.5 flex justify-between items-center shrink-0">
        <div class="text-[#4A4A4A]">
          <span class="text-xs text-[#8B8B8B] font-light">CỔNG THÀNH VIÊN NỘI TRÚ</span>
          <h2 class="font-serif font-light text-[#4A4A4A] text-lg leading-none mt-1">{{ activeTab }}</h2>
        </div>
        <div class="flex items-center gap-4">
          <div
            class="bg-[#FDFBF7] border border-[#EAE7E1] rounded-full px-4 py-1.5 text-xs text-[#6B705C] font-bold uppercase tracking-wider">
            {{ studentUser.className || 'CNTT-K15' }}
          </div>
          <div
            class="w-10 h-10 rounded-full bg-[#6B705C] text-white border border-[#EAE7E1] flex items-center justify-center font-extrabold font-mono shadow-xs text-sm">
            SV</div>
        </div>
      </header>

      <div class="p-8 flex-1">

        <div v-if="activeTab === 'Trang chủ'" class="space-y-6">
          <div class="bg-[#CB997E] text-white p-6 rounded-[32px] relative overflow-hidden shadow-sm">
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

          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="bg-white p-5 rounded-[24px] border border-[#EAE7E1] shadow-xs flex items-center gap-4">
              <div
                class="w-11 h-11 rounded-xl bg-[#6B705C]/15 text-[#6B705C] flex items-center justify-center shrink-0">
                <BedDouble class="w-5 h-5" />
              </div>
              <div>
                <div class="text-[10px] text-[#8B8B8B] font-bold uppercase">Phòng nội trú</div>
                <div class="text-base font-bold text-[#4A4A4A] font-mono mt-0.5">{{ myRoom ? `${myRoom.roomNumber}
                  (${myRoom.building})` : 'Chưa xếp' }}</div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'Phòng của tôi'"
          class="bg-white rounded-[32px] border border-[#EAE7E1] p-8 shadow-sm space-y-6">
          <div class="border-b border-[#EAE7E1] pb-4 flex justify-between items-baseline">
            <h3 class="font-serif text-[#4A4A4A] text-lg">Hồ sơ chi tiết phòng ở sinh viên</h3>
            <span class="text-xs text-[#8B8B8B] font-mono">ID: {{ myRoom ? myRoom.id : 'N/A' }}</span>
          </div>

          <div v-if="myRoom" class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-[#FDFBF7] p-4 rounded-2xl border border-[#EAE7E1]">
                  <span class="text-[10px] text-[#8B8B8B] uppercase font-bold">Số phòng ngủ</span>
                  <div class="text-lg font-bold text-[#4A4A4A] font-mono mt-1">Phòng {{ myRoom.roomNumber }}</div>
                </div>
                <div class="bg-[#FDFBF7] p-4 rounded-2xl border border-[#EAE7E1]">
                  <span class="text-[10px] text-[#8B8B8B] uppercase font-bold">Thuộc phân khu</span>
                  <div class="text-lg font-bold text-[#4A4A4A] mt-1">{{ myRoom.building }}</div>
                </div>
              </div>
            </div>
            <div class="space-y-4">
              <h4 class="font-serif text-[#4A4A4A] text-sm">Ảnh phòng mẫu đại diện</h4>
              <div class="rounded-[24px] overflow-hidden shadow-xs border border-[#EAE7E1] aspect-video">
                <img src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&q=80"
                  referrerpolicy="no-referrer" alt="My Room View" class="w-full h-full object-cover" />
              </div>
            </div>
          </div>
          <div v-else class="text-center py-12 text-[#8B8B8B] italic">Bạn chưa được sắp phòng chính thức từ văn phòng KTX.</div>
        </div>

        <div v-if="activeTab === 'Thanh toán'" class="bg-white rounded-[32px] border border-[#EAE7E1] p-8 shadow-sm space-y-6 text-left">
          <h3 class="font-serif text-[#4A4A4A] text-lg border-b border-[#EAE7E1] pb-3.5">Hóa đơn điện tử & Thanh toán</h3>
          <div class="space-y-4">
            <div v-for="inv in invoices" :key="inv.id" class="p-5 border border-[#EAE7E1] bg-[#FDFBF7]/35 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div class="flex items-center gap-4">
                <div :class="['w-12 h-12 rounded-full flex items-center justify-center shrink-0', inv.status === 'Paid' ? 'bg-[#6B705C]/15 text-[#6B705C]' : 'bg-[#CB997E]/15 text-[#CB997E]']">
                  <Receipt class="w-6 h-6" />
                </div>
                <div>
                  <h4 class="font-bold text-[#4A4A4A] text-base">{{ inv.type }} - Tháng {{ inv.month }}</h4>
                  <p class="text-xs text-[#8B8B8B] font-mono mt-1">Phòng: {{ inv.roomNumber }} • Hóa đơn: {{ inv.id.toString().substring(0,8) }}</p>
                </div>
              </div>
              <div class="flex flex-col items-end gap-2 shrink-0">
                <div class="text-lg font-bold font-mono text-[#4A4A4A]">{{ formatCurrency(inv.amount) }}đ</div>
                <div v-if="inv.status === 'Paid'" class="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold uppercase tracking-wider rounded-md flex items-center gap-1">
                  <CheckCircle2 class="w-3 h-3" /> Đã thu
                </div>
                <button v-else @click="startInvoicePayment(inv)" class="px-5 py-2 bg-[#CB997E] hover:bg-[#b07d62] text-white font-bold text-xs rounded-full shadow-xs cursor-pointer">
                  Thanh toán ngay
                </button>
              </div>
            </div>
            <div v-if="invoices.length === 0" class="text-center py-12 text-[#8B8B8B] italic text-xs font-mono">Không có hóa đơn nào cần thanh toán.</div>
          </div>
        </div>

        <div v-if="activeTab === 'Yêu cầu sửa chữa'" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 bg-white rounded-[32px] border border-[#EAE7E1] p-8 shadow-sm">
            <h3 class="font-serif text-[#4A4A4A] text-lg mb-2">Báo cáo sự cố cơ sở vật chất & Điện Nước</h3>
            <form @submit.prevent="handleMaintenanceSubmit" class="space-y-4 mt-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-xs font-bold text-[#4A4A4A]">Phát hiện lỗi gì? <span
                      class="text-[#CB997E]">*</span></label>
                  <input type="text" required v-model="maintTitle" placeholder="Rò nước vòi sen..."
                    class="w-full bg-[#FDFBF7] border border-[#EAE7E1] rounded-2xl px-4 py-2.5 text-xs outline-none focus:border-[#6B705C] transition-all" />
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-[#4A4A4A]">Phân loại lỗi</label>
                    <select v-model="maintCategory"
                      class="w-full bg-[#FDFBF7] border border-[#EAE7E1] rounded-2xl px-2 py-2.5 text-xs outline-none focus:border-[#6B705C]">
                      <option value="Điện">Điện sinh hoạt</option>
                      <option value="Nước">Đường ống nước</option>
                      <option value="Thiết bị">Đồ nội thất</option>
                    </select>
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-[#4A4A4A]">Mức yêu cầu gấp</label>
                    <select v-model="maintPriority"
                      class="w-full bg-[#FDFBF7] border border-[#EAE7E1] rounded-2xl px-2 py-2.5 text-xs outline-none focus:border-[#6B705C]">
                      <option value="Normal">Thông thường</option>
                      <option value="Critical">Khẩn cấp</option>
                    </select>
                  </div>
                </div>
              </div>
              <div class="space-y-1">
                <label class="text-xs font-bold text-[#4A4A4A]">Mô tả thực trạng <span
                    class="text-[#CB997E]">*</span></label>
                <textarea required rows="4" v-model="maintDesc" placeholder="Mô tả cụ thể..."
                  class="w-full bg-[#FDFBF7] border border-[#EAE7E1] rounded-2xl px-4 py-3 text-xs outline-none focus:border-[#6B705C] resize-none transition-all"></textarea>
              </div>
              <button type="submit"
                class="px-6 py-2.5 bg-[#6B705C] hover:bg-[#8B9178] text-white font-serif font-light text-xs rounded-full shadow-xs flex items-center gap-2 cursor-pointer">
                <span>Gửi báo kỹ thuật KTX</span>
                <Wrench class="w-4.5 h-4.5" />
              </button>
            </form>
          </div>

          <div class="bg-white rounded-[32px] border border-[#EAE7E1] p-6 shadow-sm">
            <h4 class="font-serif text-[#4A4A4A] text-sm mb-4">Các phiếu báo kỹ thuật đã gửi</h4>
            <div v-if="myMaintenance.length > 0" class="space-y-3.5">
              <div v-for="m in myMaintenance" :key="m.id"
                class="p-3.5 border border-[#EAE7E1] rounded-2xl space-y-2 text-xs bg-[#FDFBF7]">
                <div class="flex justify-between items-center font-bold">
                  <span class="text-[#4A4A4A] truncate max-w-[120px]">{{ m.title }}</span>
                  <span
                    :class="['px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase', m.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700' : 'bg-[#CB997E]/10 text-[#CB997E]']">
                    {{ m.status === 'Pending' ? 'Đang chờ' : (m.status === 'In Progress' ? 'Đang sửa' : 'Đã xong') }}
                  </span>
                </div>
                <p class="text-[#8B8B8B] font-light leading-relaxed truncate">{{ m.description }}</p>
                <div class="text-[10px] text-[#8B8B8B] font-mono">Gửi: {{ m.createdAt }}</div>
              </div>
            </div>
            <div v-else class="text-center py-12 text-[#8B8B8B] text-xs italic font-light">Chưa gửi báo hỏng nào.</div>
          </div>
        </div>

      </div>
    </main>

    <!-- Payment Modal -->
    <div v-if="isPayModalOpen && payingInvoice" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-[#4A4A4A]/40 backdrop-blur-sm" @click="isPayModalOpen = false"></div>
      <div class="bg-white rounded-[32px] p-8 max-w-sm w-full relative z-10 shadow-2xl border border-[#EAE7E1] animate-fade-in text-center">
        <div class="w-16 h-16 bg-[#CB997E]/10 text-[#CB997E] rounded-full flex items-center justify-center mx-auto mb-4">
          <Receipt class="w-8 h-8" />
        </div>
        <h3 class="font-serif text-[#4A4A4A] text-xl mb-1">Thanh toán hóa đơn</h3>
        <p class="text-xs text-[#8B8B8B] mb-6">Mã phiếu: {{ payingInvoice.id.toString().substring(0,8) }}</p>
        
        <div class="bg-[#FDFBF7] border border-[#EAE7E1] rounded-2xl p-4 mb-6">
          <div class="text-[10px] text-[#8B8B8B] font-bold uppercase tracking-wider mb-1">{{ payingInvoice.type }} - Tháng {{ payingInvoice.month }}</div>
          <div class="text-3xl font-mono font-bold text-[#4A4A4A]">{{ formatCurrency(payingInvoice.amount) }}<span class="text-lg text-[#8B8B8B]">đ</span></div>
        </div>

        <div class="space-y-3">
          <button @click="completeInvoicePayment" class="w-full py-3.5 bg-[#6B705C] hover:bg-[#8B9178] text-white font-bold text-sm rounded-full shadow-md cursor-pointer transition-colors">
            Xác nhận thanh toán
          </button>
          <button @click="isPayModalOpen = false" class="w-full py-3.5 bg-transparent hover:bg-[#FDFBF7] text-[#8B8B8B] font-bold text-sm rounded-full cursor-pointer transition-colors">
            Hủy bỏ
          </button>
        </div>
      </div>
    </div>

  </div>
</template>