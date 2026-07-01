<script setup lang="ts">
import { Phone, Mail, CheckCircle, ShieldCheck, Award, Heart } from 'lucide-vue-next';

const emit = defineEmits<{
  (e: 'navigate', screen: string): void;
}>();
</script>

<template>
  <div class="w-full text-left bg-background text-text-main">
    <section class="bg-[#A5A58D] text-white py-12 px-6 relative overflow-hidden">
      <div class="absolute inset-0 opacity-10 pointer-events-none" :style="{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '16px 16px' }"></div>
      <div class="max-w-7xl mx-auto relative z-10">
        <div class="text-white/80 text-xs mb-3 font-mono">
          <span>Trang chủ</span> &gt; <span class="text-white font-semibold">Giới thiệu</span>
        </div>
        <h1 class="text-3xl md:text-5xl font-serif font-light uppercase mb-3 text-white tracking-tight leading-none">
          Giới thiệu <span class="italic font-normal text-secondary">Ký túc xá</span>
        </h1>
        <p class="text-base md:text-lg text-white/90 font-light max-w-2xl">
          Môi trường sống hiện đại, an toàn và chuyên nghiệp dành cho sinh viên nội trú Đại học Đại Nam.
        </p>
      </div>
    </section>

    <section class="py-16 bg-background">
      <div class="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div class="lg:col-span-2 bg-white rounded-[32px] border border-border p-8 shadow-xs">
          <h2 class="text-2xl font-serif font-light text-text-main mb-6 border-b border-border pb-3 flex items-center gap-2">
            <span class="w-1.5 h-6 bg-primary rounded-full"></span>
            TỔNG QUAN VỀ KÝ TÚC XÁ DNU
          </h2>
          
          <div class="space-y-4 text-text-main text-[15px] leading-relaxed mb-8">
            <p>
              Ký túc xá Đại học Đại Nam (DNU) được xây dựng với mục tiêu mang đến một môi trường sống tiện nghi, an toàn và thân thiện cho sinh viên. Tọa lạc ngay trong khuôn viên trường, KTX giúp sinh viên tiết kiệm thời gian di chuyển, tạo điều kiện thuận lợi nhất cho việc học tập và tham gia các hoạt động ngoại khóa.
            </p>
            <p>
              Các phòng ở được thiết kế hiện đại, thông thoáng, trang bị đầy đủ tiện ích như giường tầng cao cấp, tủ quần áo cá nhân, bàn học, điều hòa, bình nóng lạnh và hệ thống Wi-Fi tốc độ cao. Đặc biệt, công tác an ninh luôn được đặt lên hàng đầu với hệ thống camera giám sát 24/7 và đội ngũ bảo vệ chuyên nghiệp.
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            <div class="h-52 rounded-[24px] overflow-hidden shadow-xs relative">
              <img src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=400&q=80" alt="DNU Dormitory Outer" referrerpolicy="no-referrer" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-black/10"></div>
            </div>
            <div class="h-52 rounded-[24px] overflow-hidden shadow-xs relative">
              <img src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&q=80" alt="DNU Dormitory Interior" referrerpolicy="no-referrer" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-black/10"></div>
            </div>
          </div>

          <h3 class="text-xl font-serif text-text-main mb-4 flex items-center gap-2">Mục tiêu & Tầm nhìn</h3>
          <ul class="space-y-4 text-sm text-text-main">
            <li class="flex items-start gap-3">
              <CheckCircle class="w-5 h-5 text-secondary shrink-0 mt-0.5" />
              <div>
                <strong class="text-text-main block font-semibold">Đảm bảo an toàn tuyệt đối</strong>
                <span class="text-text-muted font-light">Duy trì trật tự và hệ thống giám sát cổng ra vào thông minh liên tục 24/24 giờ để tạo môi trường an tâm.</span>
              </div>
            </li>
            <li class="flex items-start gap-3">
              <CheckCircle class="w-5 h-5 text-secondary shrink-0 mt-0.5" />
              <div>
                <strong class="text-text-main block font-semibold">Tối ưu hóa môi trường tự học</strong>
                <span class="text-text-muted font-light">Cung cấp máy móc, phòng đọc, wifi ổn định hỗ trợ chuẩn mực tinh thần học tập nhóm và tự nghiên cứu.</span>
              </div>
            </li>
            <li class="flex items-start gap-3">
              <CheckCircle class="w-5 h-5 text-secondary shrink-0 mt-0.5" />
              <div>
                <strong class="text-text-main block font-semibold">Phương châm phục vụ chuyên nghiệp</strong>
                <span class="text-text-muted font-light">Luôn tiếp thu phản hồi, phản ứng lập tức với hư hỏng điện nước và bảo đảm nếp sống vệ sinh văn hóa.</span>
              </div>
            </li>
          </ul>
        </div>

        <div class="space-y-6">
          <div class="bg-white rounded-[32px] border border-border overflow-hidden shadow-xs">
            <div class="bg-primary text-white p-6">
              <h3 class="font-serif font-light text-lg">BAN QUẢN LÝ KTX</h3>
              <p class="text-xs text-background/80 mt-1">Hỗ trợ trực tiếp các nhu cầu phát sinh</p>
            </div>
            <div class="p-6 space-y-6">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-primary shrink-0">
                  <Phone class="w-4.5 h-4.5" />
                </div>
                <div>
                  <div class="text-xs text-text-muted">Hotline hỗ trợ</div>
                  <div class="text-sm text-text-main font-semibold font-mono">0243.859.1484</div>
                </div>
              </div>

              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-primary shrink-0">
                  <Mail class="w-4.5 h-4.5" />
                </div>
                <div>
                  <div class="text-xs text-text-muted">Email liên hệ</div>
                  <div class="text-sm text-text-main font-semibold font-mono">ktx@dainam.edu.vn</div>
                </div>
              </div>

              <button @click="emit('navigate', 'Contact')" class="w-full py-3.5 bg-secondary hover:bg-[#A47148] text-white font-bold rounded-full shadow-sm shadow-secondary/10 transition-all cursor-pointer">
                Liên hệ trực tiếp
              </button>
            </div>
          </div>

          <div class="bg-primary-hover text-white rounded-[32px] p-6 relative overflow-hidden shadow-xs">
            <div class="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-3 translate-y-3">
              <ShieldCheck class="w-40 h-40" />
            </div>
            <h3 class="font-serif font-light text-lg mb-2 flex items-center gap-2 text-background">
              <ShieldCheck class="w-5 h-5 text-secondary" />
              Cam kết 100%
            </h3>
            <p class="text-xs text-white/95 font-light leading-relaxed mb-4">
              Sinh viên nội trú ĐH Đại Nam luôn được trải nghiệm các dịch vụ vệ sinh và an ninh an toàn tiêu chuẩn cao nhất.
            </p>
            <div class="flex items-center gap-4 border-t border-white/10 pt-4 mt-4">
              <div class="flex items-center gap-1">
                <Award class="w-4 h-4 text-secondary" />
                <span class="text-xs font-semibold">Chuẩn quốc tế</span>
              </div>
              <div class="flex items-center gap-1">
                <Heart class="w-4 h-4 text-rose-300" />
                <span class="text-xs font-semibold">Tận tâm</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  </div>
</template>