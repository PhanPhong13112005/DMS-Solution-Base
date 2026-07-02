<script setup lang="ts">
import { ref } from 'vue';
import { LogIn, KeyRound, Eye, EyeOff, User, Fingerprint, Sparkles, HelpCircle, AlertCircle, CheckCircle } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import apiClient from '../api/axios';

const router = useRouter();
const isLogin = ref(true);
const username = ref('');
const password = ref('');
const showPassword = ref(false);
const errorMsg = ref('');
const infoMsg = ref('');
const successMsg = ref('');

// Đăng ký inputs
const regName = ref('');
const regId = ref('');
const regClass = ref('');
const regPass = ref('');

const handleAuthSubmit = async () => {
  errorMsg.value = '';
  infoMsg.value = '';
  successMsg.value = '';

  if (isLogin.value) {
    if (!username.value || !password.value) {
      errorMsg.value = 'Vui lòng nhập đầy đủ tài khoản và mật khẩu!';
      return;
    }

    try {
      // 1. GỌI API LOGIN THỰC TẾ
      const response = await apiClient.post('/auth/login', {
        username: username.value,
        password: password.value
      });

      if (response.data.isSuccess) {
        successMsg.value = 'Đăng nhập thành công! Đang chuyển hướng...';
        
        const userData = response.data.data;
        // 2. LƯU TOKEN VÀO LOCALSTORAGE
        localStorage.setItem('jwt_token', userData.token);
        
        // 3. LƯU CURRENT USER VÀO LOCALSTORAGE
        const userPayload = { 
          name: userData.username, 
          id: userData.username, 
          role: userData.role,
          referenceId: userData.referenceId
        };
        localStorage.setItem('current_user', JSON.stringify(userPayload));
        
        // 4. CHUYỂN HƯỚNG DỰA THEO ROLE THỰC TẾ
        setTimeout(() => {
          if (userData.role === 'Admin') {
            router.push('/admin');
          } else if (userData.role === 'Staff') {
            router.push('/staff');
          } else {
            router.push('/');
          }
        }, 1000);
      }
    } catch (error: any) {
      errorMsg.value = error.response?.data?.message || 'Lỗi kết nối đến máy chủ!';
    }
  } else {
    // Logic Đăng ký tài khoản mới giữ nguyên...
    if (!regName.value || !regId.value || !regClass.value || !regPass.value) {
      errorMsg.value = 'Vui lòng khai báo đúng đủ tất cả các trường dữ liệu!';
      return;
    }

    // LƯU THÔNG TIN ĐĂNG KÝ VÀO LOCAL STORAGE TẠM THỜI
    localStorage.setItem(`reg_name_${regId.value}`, regName.value);
    localStorage.setItem(`reg_class_${regId.value}`, regClass.value);

    successMsg.value = `Sinh viên ${regName.value} đăng ký thành công! Đang quay lại màn hình đăng nhập...`;
    username.value = regId.value;
    password.value = regPass.value;
    isLogin.value = true;
  }
};

const setCredentials = (user: string, pass: string) => {
  username.value = user;
  password.value = pass;
  isLogin.value = true;
  errorMsg.value = '';
};

const handleForgetPassword = (e: Event) => {
  e.preventDefault();
  infoMsg.value = 'Vui lòng liên hệ trực tiếp văn phòng Ban quản lý KTX tại tầng 1 Tòa B9 để được cấp đổi lại mật khẩu!';
};
</script>

<template>
  <div class="w-full max-w-5xl mx-auto my-12 bg-white rounded-[32px] border border-border shadow-xl overflow-hidden flex flex-col md:flex-row relative">
    <div class="md:w-5/12 bg-primary text-white p-10 flex flex-col justify-between relative overflow-hidden text-left border-r border-border">
      <div class="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-12 translate-y-12">
        <Fingerprint class="w-80 h-80" />
      </div>
      <div class="relative z-10">
        <div class="inline-flex items-center gap-2 bg-secondary/20 text-secondary px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border border-secondary/30">
          <Sparkles class="w-3.5 h-3.5 animate-pulse" />
          <span>CỔNG THÔNG TIN KÝ TÚC XÁ</span>
        </div>
        <h2 class="text-3xl font-serif font-light text-white leading-tight uppercase tracking-tight">
          DNU <span class="italic font-normal text-secondary">KTX</span>
        </h2>
        <p class="text-sm font-light text-background/90 leading-relaxed mt-3">
          Hệ thống quản lý thông tin nội trú, thanh toán lệ phí trực tuyến, báo cáo kỹ thuật dành cho cán bộ Ban quản lý và sinh viên Trường Đại học Đại Nam.
        </p>
      </div>

      <div class="relative z-10 mt-12 bg-primary-light border border-primary-hover/40 p-4 rounded-2xl text-xs space-y-3 shrink-0">
        <div class="font-bold text-white uppercase tracking-widest text-[10px] pb-1 border-b border-white/10">THỬ ĐĂNG NHẬP NHANH</div>
        <div class="space-y-2 text-[11px] text-background">
          <button @click="setCredentials('SV202601', '123456')" class="w-full flex items-center justify-between p-2.5 bg-primary-dark/35 hover:bg-primary-dark/70 rounded-xl transition-all border border-white/5 text-left font-mono">
            <span>Sinh viên: <strong class="text-secondary">SV202601</strong></span>
            <span class="text-[10px] text-background/70 font-sans">Chọn</span>
          </button>
          <button @click="setCredentials('staff', '123456')" class="w-full flex items-center justify-between p-2.5 bg-primary-dark/35 hover:bg-primary-dark/70 rounded-xl transition-all border border-white/5 text-left font-mono">
            <span>Nhân viên: <strong class="text-secondary">staff</strong></span>
            <span class="text-[10px] text-background/70 font-sans">Chọn</span>
          </button>
          <button @click="setCredentials('admin', '123456')" class="w-full flex items-center justify-between p-2.5 bg-primary-dark/35 hover:bg-primary-dark/70 rounded-xl transition-all border border-white/5 text-left font-mono">
            <span>Quản trị viên: <strong class="text-secondary">admin</strong></span>
            <span class="text-[10px] text-background/70 font-sans">Chọn</span>
          </button>
        </div>
      </div>
    </div>

    <div class="md:w-7/12 p-10 flex flex-col justify-center text-left bg-white">
      <div class="max-w-md w-full mx-auto space-y-6">
        <div class="flex justify-start border-b border-border pb-3 gap-6">
          <button @click="isLogin = true; errorMsg = ''; infoMsg = '';" :class="['pb-3 font-serif font-light text-lg transition-all relative cursor-pointer', isLogin ? 'text-text-main' : 'text-slate-400']">
            <span>ĐĂNG NHẬP</span>
            <span v-if="isLogin" class="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary rounded-full"></span>
          </button>
          <button @click="isLogin = false; errorMsg = ''; infoMsg = '';" :class="['pb-3 font-serif font-light text-lg transition-all relative cursor-pointer', !isLogin ? 'text-text-main' : 'text-slate-400']">
            <span>ĐĂNG KÝ MỚI</span>
            <span v-if="!isLogin" class="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary rounded-full"></span>
          </button>
        </div>

        <div v-if="errorMsg" class="bg-secondary/15 border border-secondary/30 text-text-main p-4 rounded-2xl text-xs flex items-start gap-2.5">
          <AlertCircle class="w-5 h-5 text-secondary shrink-0 mt-0.5" /> <span>{{ errorMsg }}</span>
        </div>
        <div v-if="infoMsg" class="bg-primary-hover/10 border border-primary-hover/30 text-text-main p-4 rounded-2xl text-xs flex items-start gap-2.5">
          <HelpCircle class="w-5 h-5 text-primary shrink-0 mt-0.5" /> <span>{{ infoMsg }}</span>
        </div>
        <div v-if="successMsg" class="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs flex items-start gap-2.5">
          <CheckCircle class="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" /> <span>{{ successMsg }}</span>
        </div>

        <form @submit.prevent="handleAuthSubmit" class="space-y-4">
          <div v-if="isLogin" class="space-y-4">
            <div class="space-y-1">
              <label class="text-xs font-bold text-text-main">Tài khoản truy cập / Mã sinh viên <span class="text-secondary">*</span></label>
              <div class="relative">
                <User class="absolute left-4.5 top-1/2 -translate-y-1/2 text-text-muted w-4.5 h-4.5" />
                <input type="text" required v-model="username" placeholder="Mã sinh viên hoặc 'admin' / 'nhanvien'" class="w-full bg-background border border-border focus:border-primary rounded-2xl pl-12 pr-4 py-3 text-sm outline-none transition-all" />
              </div>
            </div>
            <div class="space-y-1">
              <div class="flex justify-between items-baseline">
                <label class="text-xs font-bold text-text-main">Mật khẩu bảo mật <span class="text-secondary">*</span></label>
                <a href="#" @click="handleForgetPassword" class="text-xs text-secondary hover:underline">Quên mật khẩu?</a>
              </div>
              <div class="relative">
                <KeyRound class="absolute left-4.5 top-1/2 -translate-y-1/2 text-text-muted w-4.5 h-4.5" />
                <input :type="showPassword ? 'text' : 'password'" required v-model="password" placeholder="**********" class="w-full bg-background border border-border focus:border-primary rounded-2xl pl-12 pr-12 py-3 text-sm outline-none transition-all" />
                <button type="button" @click="showPassword = !showPassword" class="absolute right-4.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main cursor-pointer text-xs">
                  <EyeOff v-if="showPassword" class="w-4.5 h-4.5" /> <Eye v-else class="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
            <button type="submit" class="w-full py-3.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-full shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 text-sm">
              <span>Xác minh tài khoản</span> <LogIn class="w-4.5 h-4.5" />
            </button>
          </div>

          <div v-else class="space-y-4">
            <div class="space-y-1">
              <label class="text-xs font-bold text-text-main">Họ và tên tên sinh viên <span class="text-secondary">*</span></label>
              <input type="text" required v-model="regName" placeholder="Nguyễn Văn B" class="w-full bg-background border border-border focus:border-primary rounded-2xl px-4 py-2.5 text-sm outline-none transition-all" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-xs font-bold text-text-main">Mã sinh viên <span class="text-secondary">*</span></label>
                <input type="text" required v-model="regId" placeholder="DNU201089" class="w-full bg-background border border-border focus:border-primary rounded-2xl px-4 py-2.5 text-sm outline-none transition-all" />
              </div>
              <div class="space-y-1">
                <label class="text-xs font-bold text-text-main">Lớp sinh hoạt <span class="text-secondary">*</span></label>
                <input type="text" required v-model="regClass" placeholder="K16-KT" class="w-full bg-background border border-border focus:border-primary rounded-2xl px-4 py-2.5 text-sm outline-none transition-all" />
              </div>
            </div>
            <div class="space-y-1">
              <label class="text-xs font-bold text-text-main">Mật khẩu truy cập <span class="text-secondary">*</span></label>
              <input type="password" required v-model="regPass" placeholder="Đặt ít nhất 6 ký tự" class="w-full bg-background border border-border focus:border-primary rounded-2xl px-4 py-2.5 text-sm outline-none transition-all" />
            </div>
            <button type="submit" class="w-full py-3.5 bg-secondary hover:bg-[#b07f66] text-white font-semibold rounded-full shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 text-sm">
              <span>Đăng ký thành viên</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>