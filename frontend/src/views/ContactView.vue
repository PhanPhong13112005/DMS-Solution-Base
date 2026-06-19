<script setup lang="ts">
import { ref } from 'vue';
import { Mail, Phone, MapPin, Send, Check, AlertCircle } from 'lucide-vue-next';

const name = ref('');
const studentId = ref('');
const email = ref('');
const msg = ref('');
const submitted = ref(false);
const statusMessage = ref<string | null>(null);
const statusType = ref<'success' | 'error' | null>(null);

const handleSubmit = () => {
  if (!name.value || !email.value || !msg.value) {
    statusType.value = 'error';
    statusMessage.value = 'Vui lòng điền đầy đủ họ tên, thư điện tử email và nội dung góp ý!';
    setTimeout(() => { statusMessage.value = null; }, 4000);
    return;
  }
  
  submitted.value = true;
  
  // Giả lập thời gian gửi API 1.2s
  setTimeout(() => {
    name.value = '';
    studentId.value = '';
    email.value = '';
    msg.value = '';
    submitted.value = false;
    statusType.value = 'success';
    statusMessage.value = 'Đã gửi phản hồi góp ý của bạn thành công tới Ban quản lý KTX Đại học Đại Nam!';
    setTimeout(() => { statusMessage.value = null; }, 5000);
  }, 1200);
};
</script>

<template>
  <div class="w-full text-left bg-[#FDFBF7] text-[#4A4A4A] relative">
    
    <div 
      v-if="statusMessage" 
      :class="[
        'fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2.5 border animate-fade-in transition-all', 
        statusType === 'success' ? 'bg-[#6B705C] text-[#FDFBF7] border-white/10' : 'bg-amber-500 text-white border-amber-500'
      ]"
    >
      <Check v-if="statusType === 'success'" class="w-5 h-5 text-emerald-400" />
      <AlertCircle v-else class="w-5 h-5 text-amber-200" />
      <span class="text-xs font-semibold">{{ statusMessage }}</span>
    </div>

    <section class="bg-[#A5A58D] text-white py-12 px-6 relative overflow-hidden">
      <div class="absolute inset-0 opacity-10 pointer-events-none" :style="{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '16px 16px' }"></div>
      <div class="max-w-7xl mx-auto relative z-10 flex flex-col justify-center">
        <div class="text-white/80 text-xs mb-3 font-mono">
          <span>Trang chủ</span> &gt; <span class="text-white font-semibold">Liên hệ</span>
        </div>
        <h1 class="text-3xl md:text-5xl font-serif font-light uppercase mb-3 text-white tracking-tight leading-none">
          Liên hệ & <span class="italic font-normal text-[#CB997E]">Phản hồi</span>
        </h1>
        <p class="text-base md:text-lg text-white/90 font-light max-w-2xl">
          Gửi yêu cầu giải quyết, đóng góp ý kiến hoặc phản ánh chất lượng đời sống nội dung trong KTX.
        </p>
      </div>
    </section>

    <section class="py-16 bg-[#FDFBF7]">
      <div class="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div class="space-y-6">
          <div class="bg-white rounded-[32px] border border-[#EAE7E1] p-6 flex items-start gap-4 shadow-xs text-left hover:border-[#6B705C] transition-all duration-300">
            <div class="w-12 h-12 bg-[#FDFBF7] rounded-2xl flex items-center justify-center text-[#6B705C] shrink-0">
              <MapPin class="w-5.5 h-5.5" />
            </div>
            <div>
              <h4 class="font-bold text-[#4A4A4A] text-sm mb-1">Địa chỉ Ký túc xá</h4>
              <p class="text-xs text-[#8B8B8B] font-light leading-relaxed">
                Phú Lãm, Hà Đông, Hà Nội (Nằm trong khuôn viên chính Đại học Đại Nam).
              </p>
            </div>
          </div>

          <div class="bg-white rounded-[32px] border border-[#EAE7E1] p-6 flex items-start gap-4 shadow-xs text-left hover:border-[#6B705C] transition-all duration-300">
            <div class="w-12 h-12 bg-[#FDFBF7] rounded-2xl flex items-center justify-center text-[#6B705C] shrink-0">
              <Phone class="w-5.5 h-5.5" />
            </div>
            <div>
              <h4 class="font-bold text-[#4A4A4A] text-sm mb-1">Hotline giải đáp</h4>
              <p class="text-xs text-[#8B8B8B] font-light font-mono leading-relaxed">
                0243.859.1484 (Phục vụ giờ hành chính đợt cao điểm đăng ký)
              </p>
            </div>
          </div>

          <div class="bg-white rounded-[32px] border border-[#EAE7E1] p-6 flex items-start gap-4 shadow-xs text-left hover:border-[#6B705C] transition-all duration-300">
            <div class="w-12 h-12 bg-[#FDFBF7] rounded-2xl flex items-center justify-center text-[#6B705C] shrink-0">
              <Mail class="w-5.5 h-5.5" />
            </div>
            <div>
              <h4 class="font-bold text-[#4A4A4A] text-sm mb-1">Hòm thư trực tuyến</h4>
              <p class="text-xs text-[#8B8B8B] font-light font-mono leading-relaxed">
                ktx@dainam.edu.vn
              </p>
            </div>
          </div>

          <div class="bg-white rounded-[32px] border border-[#EAE7E1] overflow-hidden shadow-xs aspect-video relative">
            <img 
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=400&q=80" 
              alt="Map representation" 
              referrerpolicy="no-referrer"
              class="w-full h-full object-cover grayscale opacity-70"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-[#6B705C]/80 to-transparent flex items-end p-4 text-white">
              <div class="text-left">
                <span class="text-[10px] uppercase font-bold tracking-wider text-[#CB997E]">Vị trí thực tế</span>
                <div class="font-serif text-sm">KTX Đại học Đại Nam</div>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-2">
          <div class="bg-white rounded-[32px] border border-[#EAE7E1] p-8 shadow-xs">
            <h2 class="text-2xl font-serif font-light text-[#4A4A4A] mb-6 border-b border-[#EAE7E1] pb-3 flex items-center gap-2">
              <span class="w-1.5 h-6 bg-[#6B705C] rounded-full"></span>
              GỬI Ý KIẾN PHẢN HỒI GÓP Ý
            </h2>

            <form @submit.prevent="handleSubmit" class="space-y-4 text-left">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-[#4A4A4A]">Họ và tên <span class="text-[#CB997E]">*</span></label>
                  <input 
                    type="text"
                    required
                    v-model="name"
                    placeholder="Nguyễn Văn A"
                    class="w-full bg-[#FDFBF7] border border-[#EAE7E1] focus:border-[#6B705C] rounded-2xl px-4 py-3 text-sm outline-none transition-all"
                  />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-[#4A4A4A]">Mã sinh viên (MSSV)</label>
                  <input 
                    type="text"
                    v-model="studentId"
                    placeholder="1771020536 (Nếu có)"
                    class="w-full bg-[#FDFBF7] border border-[#EAE7E1] focus:border-[#6B705C] rounded-2xl px-4 py-3 text-sm outline-none transition-all"
                  />
                </div>
              </div>

              <div class="space-y-1">
                <label class="text-xs font-semibold text-[#4A4A4A]">Thư điện tử Email <span class="text-[#CB997E]">*</span></label>
                <input 
                  type="email"
                  required
                  v-model="email"
                  placeholder="you@dainam.edu.vn"
                  class="w-full bg-[#FDFBF7] border border-[#EAE7E1] focus:border-[#6B705C] rounded-2xl px-4 py-3 text-sm outline-none transition-all"
                />
              </div>

              <div class="space-y-1">
                <label class="text-xs font-semibold text-[#4A4A4A]">Nội dung câu hỏi / Góp ý <span class="text-[#CB997E]">*</span></label>
                <textarea 
                  required
                  rows="5"
                  v-model="msg"
                  placeholder="Điền thắc mắc hoặc góp ý chi tiết về dịch vụ phòng, điện nước hoặc xử lý thủ tục..."
                  class="w-full bg-[#FDFBF7] border border-[#EAE7E1] focus:border-[#6B705C] rounded-2xl px-4 py-3 text-sm outline-none resize-none transition-all"
                ></textarea>
              </div>

              <button 
                type="submit"
                :disabled="submitted"
                class="w-full md:w-auto px-8 py-3.5 bg-[#6B705C] hover:bg-[#8B9178] disabled:bg-slate-300 text-white font-bold text-xs md:text-sm rounded-full shadow-md shadow-[#6B705C]/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{{ submitted ? 'Đang gửi phản hồi...' : 'Gửi phản hồi của bạn' }}</span>
                <Send class="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

      </div>
    </section>
  </div>
</template>