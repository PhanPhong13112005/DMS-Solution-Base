<script setup lang="ts">
import { useRouter } from 'vue-router'; // Thêm dòng này
import { ref, onMounted } from 'vue';
import { Compass, BookOpen, ShieldCheck, HelpCircle, ArrowRight, Home, Users, Flame, Wind, Star, ChevronRight, MessageCircle, Calendar } from 'lucide-vue-next';
import type { News } from '../types';
import { newsApi } from '../services/room-building.service';

const router = useRouter(); // Thêm dòng này

// Định nghĩa các sự kiện để truyền lên App.vue (thay thế cho onNavigate của React)
const emit = defineEmits<{
  (e: 'navigate', screen: string): void;
  (e: 'setSelectedBookingRoom', roomNumber: string): void;
}>();

const activeSlide = ref(0);
const recentNews = ref<News[]>([]);

const loadNewsData = async () => {
  try {
    const res = await newsApi.getAll();
    if (res && res.length > 0) {
      // Chỉ lấy 3 tin tức mới nhất
      recentNews.value = res.slice(0, 3);
    }
  } catch (error) {
    console.error('Lỗi tải dữ liệu tin tức trên trang chủ:', error);
  }
};

onMounted(() => {
  loadNewsData();
});

const heroSlides = [
  {
    title: "TÌM PHÒNG PHÙ HỢP",
    subtitle: "Hệ thống tìm kiếm phòng thông minh, giúp bạn chọn được nơi ở ưng ý",
    accent: "ĐĂNG KÝ PHÒNG"
  },
  {
    title: "MÔI TRƯỜNG ĐẲNG CẤP",
    subtitle: "Trang bị đầy đủ tiện nghi, wifi tốc độ cao, điều hòa mát rượi",
    accent: "ĐĂNG KÝ PHÒNG"
  }
];
</script>

<template>
  <div class="w-full bg-background text-text-main">
    <section class="relative h-[480px] bg-[#A5A58D] rounded-[32px] md:rounded-[40px] overflow-hidden flex items-center px-8 md:px-16 shadow-xl my-6 mx-auto max-w-7xl">
      <div 
        class="absolute inset-0 bg-cover bg-center opacity-30 transition-all duration-700"
        :style="{ 
          backgroundImage: activeSlide === 0 
            ? 'url(https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80)' 
            : 'url(https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80)' 
        }"
      ></div>
      <div class="absolute inset-0 bg-gradient-to-r from-black/50 via-primary/20 to-transparent z-10"></div>
      
      <div class="absolute right-0 top-0 w-1/2 h-full bg-[#B7B7A4] flex items-center justify-center opacity-35 z-0 pointer-events-none">
        <div class="w-80 h-80 rounded-full border-[30px] border-background/20"></div>
      </div>

      <div class="relative z-10 max-w-2xl text-white">
        <div class="inline-flex items-center gap-2 bg-white/20 text-background px-4.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border border-white/20 backdrop-blur-xs">
          <span class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
          <span class="font-bold tracking-widest text-background">HỆ THỐNG NỘI TRÚ ĐẠI HỌC ĐẠI NAM</span>
        </div>
        
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-serif font-light leading-tight mb-4 tracking-tight drop-shadow-sm">
          <template v-if="activeSlide === 0">Không gian sống</template>
          <template v-else>Môi trường học tập</template><br />
          <span class="italic font-normal text-secondary">
            {{ activeSlide === 0 ? "Tiện nghi & Hiện đại" : "Năng động & Gắn kết" }}
          </span>
        </h1>
        <p class="text-sm md:text-base text-white/90 max-w-xl mb-8 leading-relaxed font-light">
          {{ heroSlides[activeSlide].subtitle }}
        </p>
        
        <div class="flex flex-wrap gap-4">
          <button 
            @click="router.push('/booking')"
            class="px-8 py-3.5 bg-secondary hover:bg-[#A47148] text-white font-bold rounded-full shadow-lg shadow-secondary/20 transition-all transform hover:-translate-y-0.5 flex items-center gap-2.5 group cursor-pointer"
          >
            <span>{{ heroSlides[activeSlide].accent }}</span>
            <ArrowRight class="w-4.5 h-4.5 group-hover:translate-x-1.5 transition-transform" />
          </button>
          
          <button 
            @click="router.push('/about')"
            class="px-8 py-3.5 bg-white/10 backdrop-blur-xs text-white font-semibold rounded-full hover:bg-white/20 border border-white/25 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Tìm hiểu thêm</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4.5 h-4.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          </button>
        </div>
        </div>

      <div class="absolute bottom-6 right-12 flex items-center gap-3 z-20">
        <button 
          @click="activeSlide = activeSlide === 0 ? 1 : 0"
          class="w-9 h-9 rounded-full border border-white/30 hover:border-white/80 bg-slate-950/20 backdrop-blur-sm text-white flex items-center justify-center transition-all cursor-pointer hover:bg-primary"
        >
          ←
        </button>
        <button 
          @click="activeSlide = activeSlide === 0 ? 1 : 0"
          class="w-9 h-9 rounded-full border border-white/30 hover:border-white/80 bg-slate-950/20 backdrop-blur-sm text-white flex items-center justify-center transition-all cursor-pointer hover:bg-primary"
        >
          →
        </button>
        <span class="text-xs font-mono text-white/80 ml-3">0{{ activeSlide + 1 }} / 02</span>
      </div>
    </section>

    <section class="py-12 max-w-7xl mx-auto px-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          @click="emit('navigate', 'Rules')"
          class="group cursor-pointer bg-white p-6 rounded-[32px] border border-border shadow-xs hover:border-primary hover:shadow-md transition-all text-left flex flex-col gap-4"
        >
          <div class="w-12 h-12 bg-background rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
            <BookOpen class="w-5.5 h-5.5" />
          </div>
          <div>
            <h3 class="font-bold text-lg text-text-main group-hover:text-primary transition-colors mb-2">Thủ tục đăng ký</h3>
            <p class="text-sm text-text-muted leading-relaxed font-light">Hướng dẫn chi tiết các bước làm thủ tục nhập học và nhận phòng.</p>
          </div>
        </div>

        <div 
          @click="emit('navigate', 'About')"
          class="group cursor-pointer bg-white p-6 rounded-[32px] border border-border shadow-xs hover:border-primary hover:shadow-md transition-all text-left flex flex-col gap-4"
        >
          <div class="w-12 h-12 bg-background rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
            <Home class="w-5.5 h-5.5" />
          </div>
          <div>
            <h3 class="font-bold text-lg text-text-main group-hover:text-primary transition-colors mb-2">Mức phí & Thanh toán</h3>
            <p class="text-sm text-text-muted leading-relaxed font-light">Thông tin minh bạch về các khoản phí và hướng dẫn thanh toán trực tuyến.</p>
          </div>
        </div>

        <div 
          @click="emit('navigate', 'Rules')"
          class="group cursor-pointer bg-white p-6 rounded-[32px] border border-border shadow-xs hover:border-primary hover:shadow-md transition-all text-left flex flex-col gap-4"
        >
          <div class="w-12 h-12 bg-background rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
            <ShieldCheck class="w-5.5 h-5.5" />
          </div>
          <div>
            <h3 class="font-bold text-lg text-text-main group-hover:text-primary transition-colors mb-2">Nội quy & Quy định</h3>
            <p class="text-sm text-text-muted leading-relaxed font-light">Quy định sinh hoạt tại KTX đảm bảo an ninh trật tự và nếp sống văn minh.</p>
          </div>
        </div>

        <div 
          @click="emit('navigate', 'Contact')"
          class="group cursor-pointer bg-white p-6 rounded-[32px] border border-border shadow-xs hover:border-primary hover:shadow-md transition-all text-left flex flex-col gap-4"
        >
          <div class="w-12 h-12 bg-background rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
            <HelpCircle class="w-5.5 h-5.5" />
          </div>
          <div>
            <h3 class="font-bold text-lg text-text-main group-hover:text-primary transition-colors mb-2">Hỗ trợ sinh viên</h3>
            <p class="text-sm text-text-muted leading-relaxed font-light">Kênh liên hệ trực tiếp với Ban quản lý giải quyết các vấn đề phát sinh.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="py-16 bg-background border-y border-border">
      <div class="max-w-7xl mx-auto px-6 text-center">
        <h2 class="text-3xl font-serif font-light text-text-main tracking-tight mb-3">Quy trình đăng ký <span class="italic font-normal text-secondary">dễ dàng</span></h2>
        <p class="text-text-muted max-w-2xl mx-auto mb-12 font-light text-sm">
          Chỉ với 4 bước đơn giản, sinh viên có thể hoàn tất thủ tục đăng ký phòng ở một cách nhanh chóng và thuận tiện.
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          <div class="absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2 hidden lg:block z-0"></div>
          
          <div class="relative z-10 flex flex-col items-center bg-background p-4 rounded-2xl border border-transparent hover:border-border transition-all">
            <div class="w-14 h-14 rounded-full bg-white border border-border text-primary flex items-center justify-center mb-4 shadow-sm">
              <Users class="w-6 h-6" />
            </div>
            <span class="bg-secondary/10 text-secondary text-[10px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full mb-3">Bước 1</span>
            <h4 class="font-bold text-text-main">Đăng nhập hệ thống</h4>
          </div>

          <div class="relative z-10 flex flex-col items-center bg-background p-4 rounded-2xl border border-transparent hover:border-border transition-all">
            <div class="w-14 h-14 rounded-full bg-white border border-border text-primary flex items-center justify-center mb-4 shadow-sm">
              <Home class="w-6 h-6" />
            </div>
            <span class="bg-secondary/10 text-secondary text-[10px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full mb-3">Bước 2</span>
            <h4 class="font-bold text-text-main">Chọn phòng Ký túc xá</h4>
          </div>

          <div class="relative z-10 flex flex-col items-center bg-background p-4 rounded-2xl border border-transparent hover:border-border transition-all">
            <div class="w-14 h-14 rounded-full bg-white border border-border text-primary flex items-center justify-center mb-4 shadow-sm">
              <BookOpen class="w-6 h-6" />
            </div>
            <span class="bg-secondary/10 text-secondary text-[10px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full mb-3">Bước 3</span>
            <h4 class="font-bold text-text-main">Nộp đơn nộp hồ sơ</h4>
          </div>

          <div class="relative z-10 flex flex-col items-center bg-background p-4 rounded-2xl border border-transparent hover:border-border transition-all">
            <div class="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center mb-4 shadow-md shadow-primary/20 animate-pulse">
              <Star class="w-6 h-6" />
            </div>
            <span class="bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full mb-3">Bước 4</span>
            <h4 class="font-bold text-text-main">Xác duyệt nhận phòng</h4>
          </div>
        </div>

        <button 
          @click="router.push('/booking')"
          class="mt-12 px-8 py-3.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-full shadow-md hover:shadow-lg hover:shadow-primary/15 transition-all flex items-center gap-2 mx-auto cursor-pointer"
        >
          <span>BẮT ĐẦU ĐĂNG KÝ NGAY</span>
          <ArrowRight class="w-5 h-5" />
        </button>
      </div>
    </section>

    <section class="py-20 max-w-7xl mx-auto px-6 bg-background">
      <div class="text-center mb-16">
        <h2 class="text-3xl font-serif font-light text-text-main tracking-tight">Tiện ích & <span class="italic font-normal text-secondary">Dịch vụ nội trú</span></h2>
        <p class="text-text-muted max-w-xl mx-auto mt-3 leading-relaxed font-light text-sm">
          Trải nghiệm không gian sống tiện nghi, an toàn và hỗ trợ tối đa cho việc học tập và sinh hoạt của sinh viên.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="relative h-72 rounded-[32px] overflow-hidden group shadow-md text-left">
          <img 
            src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80" 
            alt="Premium Living" 
            referrerpolicy="no-referrer"
            class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          <div class="absolute top-5 left-5 bg-primary text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full">Tiêu chuẩn</div>
          <div class="absolute bottom-5 left-5 text-white pr-5">
            <h3 class="font-bold text-lg mb-1 font-serif">Phòng đầy đủ tiện nghi</h3>
            <p class="text-xs text-white/80 font-light">Giường tầng gỗ, tủ đồ cá nhân bằng gỗ tự nhiên, bàn học trang nhã</p>
          </div>
        </div>

        <div class="relative h-72 rounded-[32px] overflow-hidden group shadow-md text-left">
          <img 
            src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80" 
            alt="Study rooms" 
            referrerpolicy="no-referrer"
            class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          <div class="absolute top-5 left-5 bg-secondary text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full font-sans">Tri thức</div>
          <div class="absolute bottom-5 left-5 text-white pr-5">
            <h3 class="font-bold text-lg mb-1 font-serif">Khu tự học chung</h3>
            <p class="text-xs text-white/80 font-light">Không gian học yên tĩnh, được trang trí bằng cây xanh và đèn ấm áp</p>
          </div>
        </div>

        <div class="relative h-72 rounded-[32px] overflow-hidden group shadow-md text-left">
          <img 
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80" 
            alt="Fitness" 
            referrerpolicy="no-referrer"
            class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          <div class="absolute top-5 left-5 bg-primary text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full">Sức khỏe</div>
          <div class="absolute bottom-5 left-5 text-white pr-5">
            <h3 class="font-bold text-lg mb-1 font-serif">Khu thể hình đa năng</h3>
            <p class="text-xs text-white/80 font-light">Máy móc hiện đại đáp ứng đầy đủ nhu cầu rèn luyện sức khỏe hàng ngày</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 text-left">
        <div class="bg-white rounded-[24px] border border-border p-6 flex items-start gap-4 shadow-xs hover:shadow-md transition-all duration-300">
          <div class="w-12 h-12 bg-background rounded-xl flex items-center justify-center text-primary shrink-0">
            <Flame class="w-5.5 h-5.5" />
          </div>
          <div>
            <span class="text-[10px] font-bold text-secondary tracking-wider block mb-1 uppercase">Ẩm thực lành mạnh</span>
            <h4 class="font-bold text-text-main text-base mb-1">Căng tin & Siêu thị</h4>
            <p class="text-xs text-text-muted font-light leading-relaxed">Cung cấp suất ăn đầy đủ dinh dưỡng, thực phẩm hữu cơ, tươi mới và đồ uống sạch.</p>
          </div>
        </div>

        <div class="bg-white rounded-[24px] border border-border p-6 flex items-start gap-4 shadow-xs hover:shadow-md transition-all duration-300">
          <div class="w-12 h-12 bg-background rounded-xl flex items-center justify-center text-primary shrink-0">
            <Wind class="w-5.5 h-5.5" />
          </div>
          <div>
            <span class="text-[10px] font-bold text-secondary tracking-wider block mb-1 uppercase">Vệ sinh sạch sẽ</span>
            <h4 class="font-bold text-text-main text-base mb-1">Giặt sấy tự động</h4>
            <p class="text-xs text-text-muted font-light leading-relaxed">Hệ thống máy rửa, sấy hiện đại tiết kiệm nước, bảo vệ sợi vải tối đa.</p>
          </div>
        </div>

        <div class="bg-white rounded-[24px] border border-border p-6 flex items-start gap-4 shadow-xs hover:shadow-md transition-all duration-300">
          <div class="w-12 h-12 bg-background rounded-xl flex items-center justify-center text-primary shrink-0">
            <ShieldCheck class="w-5.5 h-5.5" />
          </div>
          <div>
            <span class="text-[10px] font-bold text-primary tracking-wider block mb-1 uppercase">An tâm tuyệt đối</span>
            <h4 class="font-bold text-text-main text-base mb-1">An ninh đa lớp</h4>
            <p class="text-xs text-text-muted font-light leading-relaxed">Hệ thống camera AI giám sát thông minh góc rộng, tuần tra trực đêm phối hợp.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="py-20 bg-white border-t border-border">
      <div class="max-w-7xl mx-auto px-6">
        <div class="flex justify-between items-end mb-12">
          <div>
            <h2 class="text-3xl font-serif font-light text-text-main tracking-tight">Tin tức & <span class="italic font-normal text-secondary">Sự kiện</span></h2>
            <p class="text-text-muted mt-3 font-light text-sm">Cập nhật những thông báo và hoạt động mới nhất tại Ký túc xá.</p>
          </div>
          <button @click="router.push('/news')" class="hidden md:flex items-center gap-2 text-sm font-bold text-primary hover:text-secondary transition-colors cursor-pointer">
            Xem tất cả <ArrowRight class="w-4 h-4" />
          </button>
        </div>

        <div v-if="recentNews.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <article v-for="news in recentNews" :key="news.id" class="group cursor-pointer bg-background rounded-[24px] border border-border overflow-hidden hover:shadow-md transition-all duration-300" @click="router.push('/news')">
            <div class="h-48 overflow-hidden relative">
              <img :src="news.imageUrl || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80'" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div class="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-secondary text-[10px] font-bold uppercase px-3 py-1 rounded-full shadow-sm">
                {{ news.category || 'Thông báo' }}
              </div>
            </div>
            <div class="p-6">
              <h3 class="font-bold text-text-main text-lg mb-3 group-hover:text-secondary transition-colors line-clamp-2">
                {{ news.title === 'string' ? 'Tin tức KTX' : news.title }}
              </h3>
              <p class="text-sm text-text-muted font-light line-clamp-2 mb-4">
                {{ news.content }}
              </p>
              <div class="flex items-center text-xs text-text-muted font-medium uppercase tracking-wider">
                <Calendar class="w-3.5 h-3.5 mr-1.5" />
                {{ new Date(news.createdAt || '').toLocaleDateString('vi-VN') }}
              </div>
            </div>
          </article>
        </div>
        <div v-else class="text-center py-12 text-text-muted bg-background rounded-[24px] border border-border">
          Đang tải tin tức...
        </div>
        
        <button @click="router.push('/news')" class="mt-8 w-full md:hidden flex justify-center items-center gap-2 text-sm font-bold text-primary bg-background border border-border py-3 rounded-xl hover:bg-border transition-colors cursor-pointer">
          Xem tất cả tin tức <ArrowRight class="w-4 h-4" />
        </button>
      </div>
    </section>
  </div>
</template>