<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Building2, LogIn } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();

// 1. Dùng Object rỗng thay vì null để chống lỗi Crash trắng màn hình
const loggedInUser = ref<any>({});

// 2. Tự động lắng nghe sự thay đổi URL để nạp lại User từ LocalStorage
watch(
  () => route.path,
  () => {
    const cached = localStorage.getItem('current_user');
    if (cached) {
      loggedInUser.value = JSON.parse(cached);
    } else {
      loggedInUser.value = {};
    }
  },
  { immediate: true } // Chạy ngay lần đầu tiên web được load lên
);

// Xử lý đăng xuất
const handleLogout = () => {
  localStorage.removeItem('current_user');
  loggedInUser.value = {};
  router.push('/auth');
};

// 3. Xử lý sự kiện điều hướng từ các nút bấm bên trong trang (HomeView, AboutView...)
const handleNavigation = (screenName: string) => {
  const routes: Record<string, string> = {
    'Home': '/',
    'Auth': '/auth',
    'About': '/about',
    'News': '/news',
    'Rules': '/rules',
    'Contact': '/contact',
    'Booking': '/booking',
    'Admin': '/admin',
    'Staff': '/staff',
    'Student': '/student'
  };
  
  if (routes[screenName]) {
    router.push(routes[screenName]);
  }
};

// Ẩn thanh Navbar nếu đang ở trong các cổng quản lý nội bộ
const showNavbar = computed(() => {
  const hiddenRoutes = ['/admin', '/staff', '/student'];
  return !hiddenRoutes.includes(route.path);
});

// --- DỮ LIỆU CHẠY THỬ (MOCK DATA) ---
const mockRooms = ref([
  { id: '1', roomNumber: '101', building: 'Tòa B', capacity: 4, available: 2, size: 25, price: 850000, gender: 'Nam', amenities: ['WC riêng', 'Máy lạnh'], occupants: ['1771020535'] },
  { id: '2', roomNumber: 'A102', building: 'Tòa A', capacity: 2, available: 0, size: 20, price: 1200000, gender: 'Nữ', amenities: ['Máy lạnh'], occupants: [] }
]);

const mockInvoices = ref([
  { id: 'inv-1', roomNumber: '101-Tòa B', studentId: '1771020535', month: 'Tháng 6/2026', amount: 850000, type: 'Tiền phòng', status: 'Unpaid', createdAt: '2026-06-01' }
]);

const mockMaintenance = ref([
  { id: 'maint-1', roomNumber: '101-Tòa B', title: 'Hỏng điều hòa', description: 'Điều hòa chảy nước ở cục lạnh không mát', category: 'Điện', priority: 'Normal', status: 'Pending', createdAt: '2026-06-18' }
]);



const mockApplications = ref([]);
const mockNews = ref([]);
const mockTransfers = ref([]);


</script>

<template>
  <div class="app-container bg-[#FDFBF7] min-h-screen font-sans text-[#4A4A4A]">
    
    <nav v-if="showNavbar" class="bg-white border-b border-[#EAE7E1] sticky top-0 z-50 shadow-sm">
      <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        <router-link to="/" class="flex items-center gap-3 group">
          <div class="w-10 h-10 bg-[#6B705C] text-white rounded-xl flex items-center justify-center group-hover:bg-[#8B9178] transition-colors">
            <Building2 class="w-5 h-5" />
          </div>
          <div>
            <h1 class="font-serif font-bold text-[#4A4A4A] text-lg leading-none tracking-tight group-hover:text-[#6B705C] transition-colors">DNU KTX</h1>
            <p class="text-[10px] text-[#8B8B8B] font-mono tracking-widest uppercase mt-1">Đại học Đại Nam</p>
          </div>
        </router-link>

        <div class="hidden md:flex items-center gap-8 text-sm font-semibold text-[#8B8B8B]">
          <router-link to="/" active-class="text-[#CB997E]" class="hover:text-[#4A4A4A] transition-colors">Trang chủ</router-link>
          <router-link to="/about" active-class="text-[#CB997E]" class="hover:text-[#4A4A4A] transition-colors">Giới thiệu</router-link>
          <router-link to="/news" active-class="text-[#CB997E]" class="hover:text-[#4A4A4A] transition-colors">Tin tức</router-link>
          <router-link to="/rules" active-class="text-[#CB997E]" class="hover:text-[#4A4A4A] transition-colors">Nội quy</router-link>
          <router-link to="/contact" active-class="text-[#CB997E]" class="hover:text-[#4A4A4A] transition-colors">Liên hệ</router-link>
        </div>

        <div class="flex items-center gap-3">
          <router-link to="/auth" class="hidden md:flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-[#6B705C] hover:bg-[#FDFBF7] rounded-full transition-all border border-transparent hover:border-[#EAE7E1]">
            <LogIn class="w-4 h-4" />
            <span>Cổng đăng nhập</span>
          </router-link>
          <router-link to="/booking" class="px-6 py-2.5 bg-[#CB997E] hover:bg-[#b07f66] text-white text-sm font-bold rounded-full shadow-xs transition-colors">
            Đăng ký phòng
          </router-link>
        </div>

      </div>
    </nav>

    <router-view />
    
  </div>
</template>