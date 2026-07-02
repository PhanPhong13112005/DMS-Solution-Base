<script setup lang="ts">
import { ref, computed } from 'vue';
import { Search, MapPin, Users, Heart, ClipboardCheck, ArrowRight, ShieldAlert, Upload, HelpCircle, CheckCircle2, UserCheck, CreditCard, Landmark, Coins, AlertCircle } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import type { BookingApplication } from '../types';
import { useAppData } from '../composables/useAppData';

// ============ USE TYPE-SAFE APP DATA & ACTIONS ============
const { rooms, actions } = useAppData();
const router = useRouter();

const filter = ref<string>('Tất cả');
const searchBldg = ref<string>('Tất cả');
const searchType = ref<string>('Tất cả');
const searchPrice = ref<string>('Tất cả');


// Booking Modal States
const selectedRoom = ref(null);
const isModalOpen = ref(false);
const showAuthAlert = ref(false);
const step = ref(1);
const localError = ref<string | null>(null);

// Form Inputs
const fullName = ref('');
const studentId = ref('');
const className = ref('');
const phone = ref('');
const email = ref('');
const paymentMethod = ref<'bank' | 'e-wallet' | 'direct'>('bank');
const cccdUploaded = ref(false);
const studentCardUploaded = ref(false);
const agreeRules = ref(false);
const isSubmitting = ref(false);

// Filter computation
// Filter computation
const filteredRooms = computed(() => {
  return (rooms.value ?? []).filter(room => {
    // 1. Lọc theo Tòa nhà
    const matchBldg = searchBldg.value === 'Tất cả' || room.building === searchBldg.value;

    // 2. Lọc theo Loại phòng (Sức chứa)
    let matchType = true;
    if (searchType.value !== 'Tất cả') {
      const cap = parseInt(searchType.value);
      matchType = room.capacity === cap;
    }

    // 3. Lọc theo Giá
    let matchPrice = true;
    if (searchPrice.value !== 'Tất cả') {
      if (searchPrice.value === 'Dưới 600k') matchPrice = room.price < 600000;
      else if (searchPrice.value === '600k - 1tr') matchPrice = room.price >= 600000 && room.price <= 1000000;
      else if (searchPrice.value === 'Trên 1tr') matchPrice = room.price > 1000000;
    }

    // 4. Lọc theo Tiện ích / Tag
    let matchTag = true;
    if (filter.value !== 'Tất cả') {
      if (filter.value === '2 người') matchTag = room.capacity === 2;
      else if (filter.value === '4 người') matchTag = room.capacity === 4;
      else if (filter.value === '6 người') matchTag = room.capacity === 6;
      else if (filter.value === 'WC riêng') matchTag = room.amenities.includes('WC riêng');
      else if (filter.value === 'Máy lạnh') matchTag = room.amenities.includes('Máy lạnh');
    }

    return matchBldg && matchType && matchPrice && matchTag;
  });
});

const handleOpenBooking = (room: Room) => {
  const cachedUser = localStorage.getItem('current_user');
  if (!cachedUser) {
    showAuthAlert.value = true;
    return;
  }
  
  if (room.available === 0) return;
  selectedRoom.value = room;
  step.value = 1;
  localError.value = null;
  isModalOpen.value = true;
};

const goToAuth = () => {
  router.push('/auth');
};

const resetForm = () => {
  fullName.value = '';
  studentId.value = '';
  className.value = '';
  phone.value = '';
  email.value = '';
  paymentMethod.value = 'bank';
  cccdUploaded.value = false;
  studentCardUploaded.value = false;
  agreeRules.value = false;
  step.value = 1;
  localError.value = null;
};

const handleCloseModal = () => {
  isModalOpen.value = false;
  selectedRoom.value = null;
  resetForm();
};

const handleNextStep = () => {
  localError.value = null;
  if (step.value === 1) {
    if (!fullName.value || !studentId.value || !className.value || !phone.value || !email.value) {
      localError.value = 'Vui lòng điền đầy đủ các thông tin liên hệ bắt buộc!';
      return;
    }
    step.value = 2;
  } else if (step.value === 2) {
    if (!cccdUploaded.value || !studentCardUploaded.value) {
      localError.value = 'Vui lòng hoàn tất tải lên cả 2 tài liệu minh chứng!';
      return;
    }
    step.value = 3;
  } else if (step.value === 3) {
    step.value = 4;
  }
};

const submitBooking = async () => {
  localError.value = null;
  if (!agreeRules.value) {
    localError.value = 'Bạn phải tích chọn đồng ý cam kết với nội quy KTX mới có thể tiếp tục!';
    return;
  }
  if (!selectedRoom.value) return;

  isSubmitting.value = true;
  
  try {
    const newApp = {
      fullName: fullName.value,
      studentId: studentId.value,
      className: className.value,
      phone: phone.value,
      email: email.value,
      roomId: selectedRoom.value!.id,
      roomNumber: selectedRoom.value!.roomNumber,
      building: selectedRoom.value!.building,
      paymentMethod: paymentMethod.value,
      status: 'Pending' as const,
      evidenceCCCD: 'cccd_front_' + studentId.value + '.jpg',
      evidenceStudentCard: 'student_card_' + studentId.value + '.jpg'
    };

    // Cast as BookingApplication for the action signature, although it lacks id
    await actions.addApplication(newApp as BookingApplication);
    
    isSubmitting.value = false;
    step.value = 5;
  } catch (error) {
    isSubmitting.value = false;
    localError.value = 'Đã có lỗi xảy ra khi gửi đơn! Vui lòng thử lại.';
    console.error(error);
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN').format(amount);
};
</script>

<template>
  <div class="w-full text-left bg-background text-text-main">
    <section class="bg-[#A5A58D] text-white py-14 px-6 relative overflow-hidden">
      <div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image: radial-gradient(circle at 1.5px 1.5px, white 1.5px, transparent 0); background-size: 24px 24px;"></div>
      <div class="max-w-7xl mx-auto relative z-10 text-center">
        <h1 class="text-3xl md:text-5xl font-serif font-light text-white mb-6 tracking-tight leading-none">
          Tìm phòng <span class="italic font-normal text-secondary">phù hợp nhất</span>
        </h1>
        
        <div class="bg-white rounded-[32px] border border-border p-5 md:p-6 shadow-md max-w-4xl mx-auto flex flex-col md:flex-row gap-4 items-end text-text-main">
          <div class="w-full md:w-1/3 text-left">
            <label class="block text-xs font-semibold text-text-muted mb-1.5">Tòa nhà</label>
            <select v-model="searchBldg" class="w-full bg-background border border-border rounded-2xl px-4 py-3 text-sm focus:border-primary outline-none transition-all">
              <option value="Tất cả">Tất cả tòa</option>
              <option value="Tòa A">Tòa A</option>
              <option value="Tòa B">Tòa B</option>
              <option value="Tòa C">Tòa C</option>
            </select>
          </div>
          
          <div class="w-full md:w-1/3 text-left">
            <label class="block text-xs font-semibold text-text-muted mb-1.5">Loại phòng</label>
            <select v-model="searchType" class="w-full bg-background border border-border rounded-2xl px-4 py-3 text-sm focus:border-primary outline-none transition-all">
              <option value="Tất cả">Tất cả sức chứa</option>
              <option value="2">Phòng 2 người</option>
              <option value="4">Phòng 4 người</option>
              <option value="6">Phòng 6 người</option>
            </select>
          </div>

          <div class="w-full md:w-1/3 text-left">
            <label class="block text-xs font-semibold text-text-muted mb-1.5">Mức giá</label>
            <select v-model="searchPrice" class="w-full bg-background border border-border rounded-2xl px-4 py-3 text-sm focus:border-primary outline-none transition-all">
              <option value="Tất cả">Tất cả khoảng giá</option>
              <option value="Dưới 600k">Dưới 600.000đ/tháng</option>
              <option value="600k - 1tr">600.000đ - 1.000.000đ</option>
              <option value="Trên 1tr">Trên 1.000.000đ/tháng</option>
            </select>
          </div>

          <button 
            @click="searchBldg = 'Tất cả'; searchType = 'Tất cả'; searchPrice = 'Tất cả'; filter = 'Tất cả';"
            class="w-full md:w-auto bg-primary hover:bg-primary-hover text-white font-serif font-light px-8 py-3.5 rounded-full shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer grow-0 shrink-0"
          >
            <span>Thiết lập lại</span>
          </button>
        </div>
      </div>
    </section>

    <section class="py-12 max-w-7xl mx-auto px-6">
      <div class="flex flex-wrap gap-2.5 mb-10 overflow-x-auto pb-2">
        <button
          v-for="tag in ['Tất cả', '2 người', '4 người', '6 người', 'WC riêng', 'Máy lạnh']"
          :key="tag"
          @click="filter = tag"
          :class="['px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider border-2 transition-all cursor-pointer', filter === tag ? 'bg-primary border-primary text-white shadow-xs' : 'bg-white border-border text-text-main hover:border-primary']"
        >
          {{ tag }}
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div 
          v-for="room in filteredRooms"
          :key="room.id"
          :class="['bg-white rounded-[32px] border transition-all duration-300 flex flex-col h-full overflow-hidden', room.available > 0 ? 'border-border shadow-xs hover:shadow-md hover:border-primary group' : 'border-border opacity-75']"
        >
          <div class="relative h-44 bg-background overflow-hidden shrink-0">
            <img 
              :src="room.capacity === 2 ? 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&q=80' : (room.capacity === 4 ? 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=400&q=80' : 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=400&q=80')" 
              referrerpolicy="no-referrer"
              :alt="`Room ${room.roomNumber}`"
              class="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
            />
            <span v-if="room.available > 0" class="absolute top-3 right-3 bg-primary-hover text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg">
              {{ room.available }} Chỗ trống
            </span>
            <span v-else class="absolute top-3 right-3 bg-secondary text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg">
              Đã đầy
            </span>
            <div class="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex items-end p-4">
              <h3 class="font-serif font-light text-white text-lg tracking-tight">Phòng {{ room.roomNumber }} - {{ room.building }}</h3>
            </div>
          </div>

          <div class="p-5 flex flex-col flex-1 text-text-main">
            <div class="flex justify-between items-center text-xs text-text-muted mb-4 bg-background p-2.5 rounded-2xl border border-border">
              <span class="flex items-center gap-1.5">
                <Users class="w-3.5 h-3.5 text-text-muted" />
                <strong>{{ room.capacity }} Người</strong>
              </span>
              <span>|</span>
              <span class="flex items-center gap-1">
                <MapPin class="w-3.5 h-3.5 text-text-muted" />
                Mặt bằng: <strong>{{ room.size }}m²</strong>
              </span>
            </div>

            <div class="flex flex-wrap gap-1.5 mb-6">
              <template v-if="room.amenities.length > 0">
                <span v-for="amen in room.amenities" :key="amen" class="bg-secondary/10 border border-secondary/20 text-secondary text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-lg">
                  {{ amen }}
                </span>
              </template>
              <span v-else class="text-xs text-text-muted italic">Tiện ích cơ bản</span>
            </div>

            <div class="mt-auto border-t border-border pt-4 flex flex-col gap-3">
              <div class="flex justify-between items-baseline">
                <span class="text-xs text-text-muted font-light">Giá lưu trú:</span>
                <span class="text-lg font-bold text-secondary tracking-tight">
                  {{ formatCurrency(room.price) }}đ
                  <span class="text-xs text-text-muted font-normal"> /tháng</span>
                </span>
              </div>

              <button
                :disabled="room.available === 0"
                @click="handleOpenBooking(room)"
                :class="['w-full py-3 font-semibold text-xs md:text-sm rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer', room.available > 0 ? 'bg-primary hover:bg-primary-hover text-white shadow-xs' : 'bg-slate-100 text-slate-400 cursor-not-allowed']"
              >
                <span>{{ room.available > 0 ? 'Đăng ký lưu trú' : 'Hết chỗ' }}</span>
                <ArrowRight v-if="room.available > 0" class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div v-if="filteredRooms.length === 0" class="col-span-full bg-white border border-border rounded-[32px] p-12 text-center text-text-muted font-light max-w-xl mx-auto w-full">
          <ShieldAlert class="w-12 h-12 text-secondary mx-auto mb-3 opacity-80" />
          <span>Không tìm thấy phòng ở phù hợp với các tiêu chí tìm kiếm. Hãy tối giản bộ lọc và tìm lại.</span>
        </div>
      </div>
    </section>

    <div v-if="isModalOpen && selectedRoom" class="fixed inset-0 bg-text-main/60 backdrop-blur-xs flex items-center justify-center z-[100] p-4 text-left">
      <div class="bg-white rounded-[32px] border border-border shadow-xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        <div class="bg-primary text-white p-6 relative">
          <button @click="handleCloseModal" class="absolute top-4 right-4 text-white/75 hover:text-white text-xl p-1 cursor-pointer">✕</button>
          <h3 class="text-lg font-serif font-light tracking-tight mb-1 text-white">Đăng ký lưu trú Ký túc xá</h3>
          <p class="text-xs text-background/95">
            Đang tuyển ký: <strong class="text-secondary">Phòng {{ selectedRoom.roomNumber }} ({{ selectedRoom.building }})</strong>
          </p>

          <div v-if="step <= 4" class="flex flex-wrap items-center gap-x-2 gap-y-1 mt-4 text-[10px] uppercase font-bold tracking-wider text-background/70">
            <span :class="{ 'text-secondary': step >= 1 }">1. Điền đơn</span><span>&gt;</span>
            <span :class="{ 'text-secondary': step >= 2 }">2. Minh chứng</span><span>&gt;</span>
            <span :class="{ 'text-secondary': step >= 3 }">3. Thanh toán</span><span>&gt;</span>
            <span :class="{ 'text-secondary': step >= 4 }">4. Cam kết</span>
          </div>
        </div>

        <div class="p-6 overflow-y-auto flex-1 space-y-5">
          <div v-if="localError" class="bg-secondary/10 border border-secondary/30 p-4 rounded-2xl text-xs text-secondary flex items-start gap-2.5 font-light">
            <AlertCircle class="w-5 h-5 shrink-0 text-secondary" />
            <span>{{ localError }}</span>
          </div>

          <div v-if="step === 1" class="space-y-4">
            <div class="bg-background p-4 border border-border rounded-2xl flex items-start gap-3">
              <UserCheck class="w-5 h-5 text-secondary mt-0.5 shrink-0" />
              <p class="text-xs text-text-muted leading-relaxed font-light">Vui lòng khai báo đầy đủ họ tên, thông tin mã sinh viên...</p>
            </div>
            <div class="space-y-1">
              <label class="text-xs font-semibold text-text-main">Họ và tên thí sinh <span class="text-secondary">*</span></label>
              <input type="text" v-model="fullName" placeholder="Nguyễn Văn A" class="w-full bg-background border border-border focus:border-primary rounded-2xl px-4 py-2.5 text-sm outline-none transition-all" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-xs font-semibold text-text-main">Mã sinh viên <span class="text-secondary">*</span></label>
                <input type="text" v-model="studentId" placeholder="1771020536" class="w-full bg-background border border-border focus:border-primary rounded-2xl px-4 py-2.5 text-sm outline-none transition-all" />
              </div>
              <div class="space-y-1">
                <label class="text-xs font-semibold text-text-main">Lớp sinh hoạt <span class="text-secondary">*</span></label>
                <input type="text" v-model="className" placeholder="CNTT1708" class="w-full bg-background border border-border focus:border-primary rounded-2xl px-4 py-2.5 text-sm outline-none transition-all" />
              </div>
            </div>
            <div class="space-y-1">
              <label class="text-xs font-semibold text-text-main">Số điện thoại liên hệ <span class="text-secondary">*</span></label>
              <input type="tel" v-model="phone" placeholder="0912345678" class="w-full bg-background border border-border focus:border-primary rounded-2xl px-4 py-2.5 text-sm outline-none transition-all" />
            </div>
            <div class="space-y-1">
              <label class="text-xs font-semibold text-text-main">Địa chỉ Email học tập <span class="text-secondary">*</span></label>
              <input type="email" v-model="email" placeholder="viana@dainam.edu.vn" class="w-full bg-background border border-border focus:border-primary rounded-2xl px-4 py-2.5 text-sm outline-none transition-all" />
            </div>
          </div>

          <div v-if="step === 2" class="space-y-5">
            <h4 class="font-serif text-text-main text-sm">Tải lên hồ sơ minh chứng</h4>
            <div class="space-y-3">
              <label class="block border-2 border-dashed border-border hover:border-primary rounded-2xl p-6 text-center cursor-pointer transition-all bg-background">
                <input type="file" class="hidden" accept="image/*,.pdf" @change="cccdUploaded = !!($event.target.files && $event.target.files.length)" />
                <Upload :class="['w-8 h-8 mx-auto mb-2', cccdUploaded ? 'text-primary' : 'text-text-muted']" />
                <div class="text-xs font-bold text-text-main">Căn cước công dân <span class="text-secondary">*</span></div>
                <span v-if="cccdUploaded" class="text-primary text-xs font-semibold block mt-1.5">✓ Đính kèm thành công!</span>
              </label>
              <label class="block border-2 border-dashed border-border hover:border-primary rounded-2xl p-6 text-center cursor-pointer transition-all bg-background">
                <input type="file" class="hidden" accept="image/*,.pdf" @change="studentCardUploaded = !!($event.target.files && $event.target.files.length)" />
                <Upload :class="['w-8 h-8 mx-auto mb-2', studentCardUploaded ? 'text-primary' : 'text-text-muted']" />
                <div class="text-xs font-bold text-text-main">Thẻ sinh viên / Giấy báo <span class="text-secondary">*</span></div>
                <span v-if="studentCardUploaded" class="text-primary text-xs font-semibold block mt-1.5">✓ Đính kèm thành công!</span>
              </label>
            </div>
          </div>

          <div v-if="step === 3" class="space-y-4">
            <h4 class="font-serif text-text-main text-sm">Phương thức đóng lệ phí KTX</h4>
            <div class="space-y-3">
              <label :class="['flex items-center gap-4 p-4 border rounded-2xl cursor-pointer hover:border-secondary transition-all', paymentMethod === 'bank' ? 'border-secondary bg-secondary/10' : 'border-border']">
                <input type="radio" v-model="paymentMethod" value="bank" class="text-primary focus:ring-primary w-4.5 h-4.5" />
                <div class="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-primary shrink-0"><Landmark class="w-5 h-5" /></div>
                <div><div class="text-sm font-bold text-text-main">Chuyển khoản Ngân hàng</div></div>
              </label>
              <div v-if="paymentMethod === 'bank'" class="p-4 bg-background rounded-xl border border-border text-sm text-text-main animate-in fade-in slide-in-from-top-2">
                <p class="font-bold mb-2 text-secondary">Thông tin chuyển khoản:</p>
                <p>Ngân hàng: <strong>Vietcombank</strong></p>
                <p>Số tài khoản: <strong>0123456789</strong></p>
                <p>Chủ tài khoản: <strong>ĐẠI HỌC ĐẠI NAM</strong></p>
                <p class="mt-2 text-xs text-text-muted">Cú pháp: <span class="font-bold text-primary">KTX {{ studentId || '[Mã Sinh Viên]' }} {{ fullName || '[Họ Tên]' }}</span></p>
                <div class="mt-4 flex justify-center">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" alt="QR Code" class="w-32 h-32 rounded-lg border border-border p-2 bg-white" />
                </div>
              </div>

              <label :class="['flex items-center gap-4 p-4 border rounded-2xl cursor-pointer hover:border-secondary transition-all', paymentMethod === 'e-wallet' ? 'border-secondary bg-secondary/10' : 'border-border']">
                <input type="radio" v-model="paymentMethod" value="e-wallet" class="text-primary focus:ring-primary w-4.5 h-4.5" />
                <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0"><CreditCard class="w-5 h-5" /></div>
                <div><div class="text-sm font-bold text-text-main">Ví điện tử MoMo / ShopeePay</div></div>
              </label>
              <div v-if="paymentMethod === 'e-wallet'" class="p-4 bg-background rounded-xl border border-border text-sm text-text-main text-center animate-in fade-in slide-in-from-top-2">
                <p class="font-bold mb-3 text-secondary">Quét mã QR qua ứng dụng Ví điện tử</p>
                <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" alt="Momo QR Code" class="w-32 h-32 mx-auto rounded-lg border border-border p-2 bg-white" />
              </div>

              <label :class="['flex items-center gap-4 p-4 border rounded-2xl cursor-pointer hover:border-secondary transition-all', paymentMethod === 'direct' ? 'border-secondary bg-secondary/10' : 'border-border']">
                <input type="radio" v-model="paymentMethod" value="direct" class="text-primary focus:ring-primary w-4.5 h-4.5" />
                <div class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0"><Coins class="w-5 h-5" /></div>
                <div><div class="text-sm font-bold text-text-main">Thanh toán tiền mặt trực tiếp</div></div>
              </label>
              <div v-if="paymentMethod === 'direct'" class="p-4 bg-background rounded-xl border border-border text-sm text-text-main animate-in fade-in slide-in-from-top-2">
                <p class="leading-relaxed">Vui lòng mang theo số tiền mặt tương ứng lệ phí phòng KTX đến <strong class="text-secondary">Phòng Kế toán (P.101 Tòa A)</strong> trong vòng 3 ngày làm việc sau khi nộp đơn để hoàn tất thủ tục đăng ký.</p>
              </div>
            </div>
          </div>

          <div v-if="step === 4" class="space-y-4">
            <h4 class="font-serif text-text-main text-sm">Xác nhận thỏa thuận</h4>
            <label class="flex items-start gap-3 p-3 border border-border rounded-2xl cursor-pointer hover:bg-background select-none">
              <input type="checkbox" v-model="agreeRules" class="rounded border-border text-primary focus:ring-primary/35 w-5 h-5 mt-0.5" />
              <div class="text-xs text-text-muted leading-relaxed">Tôi xác nhận đã đọc và am hiểu kỹ lưỡng <strong class="text-text-main">Cam kết thỏa thuận nội trú</strong>.</div>
            </label>
          </div>

          <div v-if="step === 5" class="text-center py-6 space-y-4 animate-fade-in">
            <div class="w-16 h-16 bg-background text-primary rounded-full flex items-center justify-center mx-auto border border-border">
              <CheckCircle2 class="w-10 h-10" />
            </div>
            <h3 class="text-xl font-serif text-text-main">Đăng ký phòng thành công!</h3>
            <p class="text-sm text-text-muted leading-relaxed font-light px-4">Đã ghi nhận dữ liệu đề xuất từ <strong class="text-text-main">{{ fullName }}</strong>. Ban quản lý sẽ phản hồi sớm nhất qua Email.</p>
          </div>
        </div>

        <div v-if="step < 5" class="bg-background px-6 py-4 border-t border-border flex items-center justify-between">
          <button @click="step === 1 ? handleCloseModal() : step--" class="px-5 py-2.5 bg-white border border-border text-text-main text-xs font-bold rounded-2xl hover:bg-background cursor-pointer">
            {{ step === 1 ? 'Hủy bỏ' : 'Quay lại' }}
          </button>
          <button v-if="step === 4" @click="submitBooking" :disabled="isSubmitting" class="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-full flex items-center gap-2 shadow-xs cursor-pointer">
            {{ isSubmitting ? 'Đăng đơn...' : 'Xác nhận Hồ sơ' }}
            <CheckCircle2 v-if="!isSubmitting" class="w-4 h-4" />
          </button>
          <button v-else @click="handleNextStep" class="px-6 py-2.5 bg-text-main hover:bg-[#6B6B6B] text-white text-xs font-bold rounded-full flex items-center gap-2 cursor-pointer">
            <span>Tiếp tục</span>
            <ArrowRight class="w-4 h-4" />
          </button>
        </div>
        <div v-else class="bg-background px-6 py-4 border-t border-border">
          <button @click="handleCloseModal" class="w-full py-3 bg-primary text-white font-bold rounded-full hover:bg-primary-hover transition-all text-center text-xs cursor-pointer">Xác nhận và kết thúc</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Custom Auth Alert Modal -->
  <div v-if="showAuthAlert" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showAuthAlert = false"></div>
    <div class="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-border animate-in fade-in zoom-in duration-200">
      <div class="p-6 text-center space-y-4">
        <div class="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-100 mb-2">
          <ShieldAlert class="w-8 h-8" />
        </div>
        <h3 class="text-xl font-serif font-bold text-text-main">Yêu cầu Đăng nhập</h3>
        <p class="text-sm text-text-muted leading-relaxed font-light px-2">Bạn cần đăng nhập bằng tài khoản Sinh viên để có thể tiến hành chọn và đăng ký phòng KTX.</p>
      </div>
      <div class="bg-background px-6 py-4 border-t border-border flex items-center justify-between gap-3">
        <button @click="showAuthAlert = false" class="flex-1 py-2.5 bg-white border border-border text-text-main text-xs font-bold rounded-2xl hover:bg-gray-50 transition-colors">Đóng</button>
        <button @click="goToAuth" class="flex-1 py-2.5 bg-accent text-white text-xs font-bold rounded-2xl hover:bg-accent-hover transition-colors shadow-sm">Đăng nhập ngay</button>
      </div>
    </div>
  </div>

</template>