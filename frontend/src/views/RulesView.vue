<script setup lang="ts">
import { ref } from 'vue';
import { FileText, ChevronDown, ChevronUp, Lock, AlertOctagon, Check } from 'lucide-vue-next';

const openAccordion = ref<number>(0);
const downloadMsg = ref<string | null>(null);

const triggerDownload = (fileName: string) => {
  downloadMsg.value = `Đang khởi tạo tải xuống file: ${fileName}`;
  setTimeout(() => { downloadMsg.value = null; }, 4000);
};

const accordions = [
  { title: "1. Giờ giấc sinh hoạt & Giới nghiêm", content: "• Giờ mở cửa Ký túc xá: 05:30 hàng ngày.\n• Giờ đóng cửa giới nghiêm bảo vệ: 22:30 hàng ngày.\n• Giờ tắt điện chính/yêu cầu im lặng giữ trật tự: 23:00 đến 05:30 hôm sau." },
  { title: "2. An ninh trật tự & Tiếp đón bạn bè", content: "• Khách đến thăm phải đăng ký với phòng bảo vệ trực ban tại cổng chính.\n• Không cho người lạ hoặc bạn bè ngủ qua đêm trái phép.\n• Giữ gìn và tự chịu trách nhiệm bảo quản tài sản điện thoại, ví cá nhân." },
  { title: "3. Vệ sinh chung & Rác thải sinh hoạt", content: "• Sinh viên có trách nhiệm vệ sinh sạch sẽ trong phòng ở hàng ngày.\n• Định kỳ thứ 7 hàng tuần tiến hành tổng vệ sinh toàn nhà.\n• Không đổ chất thải, thức ăn thừa vào bồn rửa chén gây nghẹt cống dẫn nước." },
  { title: "4. Sử dụng năng lượng điện nước tiết kiệm", content: "• Tắt hết tất cả thiết bị sạc điện, bóng đèn, quạt máy khi ra khỏi phòng.\n• Sử dụng nước sinh hoạt đúng mục đích, khóa chặt vòi nước sau khi dùng.\n• Mọi sự cố rò rỉ điện nước cần gửi thông báo khẩn cấp cho ban kỹ thuật." }
];
</script>

<template>
  <div class="w-full text-left bg-[#FDFBF7] text-[#4A4A4A] relative">
    <div v-if="downloadMsg" class="fixed bottom-6 right-6 z-50 bg-[#6B705C] text-[#FDFBF7] px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-white/20 animate-fade-in transition-all">
      <Check class="w-4.5 h-4.5 text-emerald-400" /> <span class="text-xs font-semibold">{{ downloadMsg }}</span>
    </div>

    <section class="bg-[#A5A58D] text-white py-12 px-6 relative overflow-hidden">
      <div class="absolute inset-0 opacity-10 pointer-events-none" :style="{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '16px 16px' }"></div>
      <div class="max-w-7xl mx-auto relative z-10 flex flex-col justify-center">
        <div class="text-white/80 text-xs mb-3 font-mono">
          <span>Trang chủ</span> &gt; <span class="text-white font-semibold">Nội quy lưu trú</span>
        </div>
        <h1 class="text-3xl md:text-5xl font-serif font-light uppercase mb-3 text-white tracking-tight leading-none">
          Nội quy <span class="italic font-normal text-[#CB997E]">Ký túc xá</span>
        </h1>
        <p class="text-base md:text-lg text-white/90 font-light max-w-2xl">
          Sổ tay hướng dẫn nếp sống nội trú văn minh, kỷ cương và tuyệt đối đảm bảo an toàn phòng chống cháy nổ.
        </p>
      </div>
    </section>

    <section class="py-16 bg-[#FDFBF7]">
      <div class="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white rounded-[32px] border border-[#EAE7E1] p-8 shadow-xs">
            <h2 class="text-2.5xl font-serif font-light text-[#4A4A4A] mb-6 border-b border-[#EAE7E1] pb-3 flex items-center gap-2">
              <span class="w-1.5 h-6 bg-[#6B705C] rounded-full"></span> ĐIỀU KHOẢN QUY ĐỊNH NỘI TRÚ
            </h2>

            <div class="space-y-3">
              <div v-for="(acc, index) in accordions" :key="index" class="border border-[#EAE7E1] rounded-2xl overflow-hidden transition-all">
                <button @click="openAccordion = openAccordion === index ? -1 : index" :class="['w-full flex items-center justify-between px-6 py-4 text-left transition-all font-bold text-sm cursor-pointer', openAccordion === index ? 'bg-[#6B705C] text-white' : 'bg-white text-[#4A4A4A] hover:bg-[#FDFBF7]']">
                  <span>{{ acc.title }}</span>
                  <ChevronUp v-if="openAccordion === index" class="w-4.5 h-4.5 text-white" />
                  <ChevronDown v-else class="w-4.5 h-4.5 text-[#8B8B8B]" />
                </button>
                <div v-if="openAccordion === index" class="p-6 bg-white text-xs md:text-sm text-[#8B8B8B] leading-relaxed whitespace-pre-line font-light">
                  {{ acc.content }}
                </div>
              </div>
            </div>
          </div>

          <div class="bg-[#CB997E]/10 border border-[#CB997E]/30 rounded-[32px] p-8 shadow-xs text-left">
            <h3 class="font-serif font-light text-red-900 text-lg flex items-center gap-2.5 mb-4">
              <AlertOctagon class="w-5.5 h-5.5 text-[#CB997E] shrink-0" /> CÁC CẤM CHỈ HOÀN TOÀN TRONG KÝ TÚC XÁ
            </h3>
            <ul class="space-y-3.5 text-xs md:text-sm text-[#4A4A4A] leading-relaxed font-light">
              <li class="flex items-start gap-2.5"><span class="w-2 h-2 rounded-full bg-[#CB997E] shrink-0 mt-2"></span><span><strong>Sử dụng thiết bị đun nấu sinh nhiệt trái phép:</strong> Cấm sử dụng bếp ga, bếp cồn, lò sấy nướng.</span></li>
              <li class="flex items-start gap-2.5"><span class="w-2 h-2 rounded-full bg-[#CB997E] shrink-0 mt-2"></span><span><strong>Tàng trữ rượu bia, bài bạc:</strong> Tuyệt đối cấm các hành vi rượu bia say xỉn la hét, tàng trữ cờ bạc ăn tiền.</span></li>
              <li class="flex items-start gap-2.5"><span class="w-2 h-2 rounded-full bg-[#CB997E] shrink-0 mt-2"></span><span><strong>Dẫn người lạ vào qua đêm không đăng ký:</strong> Sẽ bị xem xét đuổi khỏi ký túc xá lập tức.</span></li>
            </ul>
          </div>
        </div>

        <div class="space-y-6">
          <div class="bg-white rounded-[32px] border border-[#EAE7E1] p-6 shadow-xs text-left">
            <h3 class="font-serif text-[#4A4A4A] text-lg mb-2">Tài liệu tải xuống</h3>
            <p class="text-xs text-[#8B8B8B] font-light mb-5">Các quy chế, văn bản pháp lí mẫu đính kèm định dạng PDF.</p>

            <div class="space-y-3">
              <a href="#" @click.prevent="triggerDownload('Noi_quy_DNU_KTX_2026.pdf')" class="flex items-center gap-3.5 p-3.5 border border-[#EAE7E1] hover:border-[#6B705C] hover:bg-[#FDFBF7] rounded-2xl transition-all font-bold text-xs md:text-sm text-[#4A4A4A]">
                <FileText class="w-9 h-9 text-[#CB997E] shrink-0" />
                <div class="text-left">
                  <div class="font-semibold text-[#4A4A4A] leading-tight">Nội quy Ký túc xá ĐH Đại Nam</div>
                  <div class="text-[10px] text-[#8B8B8B] font-mono mt-0.5">PDF • 1.5 MB</div>
                </div>
              </a>
              <a href="#" @click.prevent="triggerDownload('Quy_trinh_ky_luat_DNU.pdf')" class="flex items-center gap-3.5 p-3.5 border border-[#EAE7E1] hover:border-[#6B705C] hover:bg-[#FDFBF7] rounded-2xl transition-all font-bold text-xs md:text-sm text-[#4A4A4A]">
                <FileText class="w-9 h-9 text-[#CB997E] shrink-0" />
                <div class="text-left">
                  <div class="font-semibold text-[#4A4A4A] leading-tight">Quy trình xử lý kỷ luật sinh viên</div>
                  <div class="text-[10px] text-[#8B8B8B] font-mono mt-0.5">PDF • 850 KB</div>
                </div>
              </a>
            </div>
          </div>

          <div class="bg-[#8B9178] text-white rounded-[32px] p-6 relative overflow-hidden shadow-xs">
            <h4 class="font-serif font-light mb-2 text-md flex items-center gap-1.5 text-white">
              <Lock class="w-4.5 h-4.5 text-[#CB997E]" /> Lưu ý quan trọng
            </h4>
            <p class="text-xs text-white/95 font-light leading-relaxed">Vi phạm nội quy quá 3 lần trong một học kỳ sẽ bị gửi hồ sơ kỷ luật chấm dứt quyền tạm trú ngay lập tức.</p>
          </div>
        </div>

      </div>
    </section>
  </div>
</template>