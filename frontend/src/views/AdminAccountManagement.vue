<script setup lang="ts">
import { ref, onMounted } from 'vue';
import apiClient from '../api/axios';
import { Search, PlusCircle, Lock, Unlock, KeyRound, Shield, UserX, UserCheck } from 'lucide-vue-next';

const accounts = ref<any[]>([]);
const search = ref('');
const showCreateModal = ref(false);
const toast = ref<{ message: string; type: 'success' | 'error' } | null>(null);

const form = ref({
  username: '',
  password: '',
  fullName: '',
  role: 'Staff'
});

const showToast = (message: string, type: 'success' | 'error') => {
  toast.value = { message, type };
  setTimeout(() => toast.value = null, 3000);
};

const loadAccounts = async () => {
  try {
    const res = await apiClient.get('/auth/accounts');
    if (res.data && res.data.isSuccess) {
      accounts.value = res.data.data;
    }
  } catch (err) {
    console.error("Failed to load accounts", err);
  }
};

const handleCreateAccount = async () => {
  try {
    await apiClient.post('/auth/register-staff', form.value);
    showToast('Tạo tài khoản cán bộ thành công!', 'success');
    showCreateModal.value = false;
    form.value = { username: '', password: '', fullName: '', role: 'Staff' };
    await loadAccounts();
  } catch (err: any) {
    showToast(err.response?.data?.message || 'Lỗi khi tạo tài khoản', 'error');
  }
};

const toggleLock = async (account: any) => {
  try {
    await apiClient.put(`/auth/accounts/${account.id}/lock`);
    showToast(`Đã ${account.isLocked ? 'mở khóa' : 'khóa'} tài khoản!`, 'success');
    await loadAccounts();
  } catch (err) {
    showToast('Không thể thay đổi trạng thái!', 'error');
  }
};

const resetPassword = async (account: any) => {
  try {
    await apiClient.put(`/auth/accounts/${account.id}/reset-password`);
    showToast('Đã đặt lại mật khẩu về mặc định (123456)', 'success');
  } catch (err) {
    showToast('Lỗi khi đặt lại mật khẩu!', 'error');
  }
};

onMounted(() => {
  loadAccounts();
});
</script>

<template>
  <div class="bg-background text-left animate-fade-in pb-10">
    <div v-if="toast" class="fixed top-6 right-6 z-[200] p-4 rounded-xl shadow-lg border"
         :class="toast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'">
      {{ toast.message }}
    </div>

    <div class="flex justify-between items-center mb-6">
      <div>
        <h3 class="font-serif text-text-main text-2xl font-bold">Quản lý Tài khoản (Identity)</h3>
        <p class="text-text-muted text-xs mt-1">Hệ thống phân quyền & Bảo mật</p>
      </div>
      <button @click="showCreateModal = true" class="px-4 py-2 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-full shadow-sm flex items-center gap-2">
        <PlusCircle class="w-4 h-4" /> Tạo Tài khoản Cán bộ
      </button>
    </div>

    <div class="bg-white rounded-[32px] border border-border p-8 shadow-sm">
      <div class="relative max-w-md mb-6">
        <Search class="w-4 h-4 text-text-muted absolute left-4 top-1/2 -translate-y-1/2" />
        <input type="text" v-model="search" placeholder="Tìm kiếm tài khoản..." class="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-full text-xs outline-none focus:border-primary" />
      </div>

      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="text-[10px] font-bold text-text-muted uppercase tracking-wider border-b border-border">
            <th class="py-3 px-4">Tài khoản</th>
            <th class="py-3 px-4">Họ Tên</th>
            <th class="py-3 px-4 text-center">Phân quyền</th>
            <th class="py-3 px-4 text-center">Trạng thái</th>
            <th class="py-3 px-4 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="acc in accounts" :key="acc.id" class="border-b border-border/50 hover:bg-background/50 transition-colors text-xs text-text-main">
            <td class="py-3 px-4 font-mono font-medium">{{ acc.username }}</td>
            <td class="py-3 px-4">{{ acc.fullName }}</td>
            <td class="py-3 px-4 text-center">
              <span class="px-2 py-1 rounded text-[10px] font-bold"
                    :class="acc.role === 'Admin' ? 'bg-rose-100 text-rose-700' : acc.role === 'Staff' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'">
                {{ acc.role }}
              </span>
            </td>
            <td class="py-3 px-4 text-center">
              <span v-if="acc.isLocked" class="text-rose-500 flex items-center justify-center gap-1"><Lock class="w-3 h-3" /> Bị khóa</span>
              <span v-else class="text-emerald-500 flex items-center justify-center gap-1"><UserCheck class="w-3 h-3" /> Hoạt động</span>
            </td>
            <td class="py-3 px-4 flex justify-end gap-2">
              <button @click="resetPassword(acc)" class="px-3 py-1.5 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg flex items-center gap-1 hover:bg-yellow-100 transition-colors" title="Reset Mật khẩu">
                <KeyRound class="w-3 h-3" /> Reset
              </button>
              <button @click="toggleLock(acc)" class="px-3 py-1.5 border rounded-lg flex items-center gap-1 transition-colors"
                      :class="acc.isLocked ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'">
                <Unlock v-if="acc.isLocked" class="w-3 h-3" /> <Lock v-else class="w-3 h-3" /> {{ acc.isLocked ? 'Mở Khóa' : 'Khóa' }}
              </button>
            </td>
          </tr>
          <tr v-if="accounts.length === 0">
            <td colspan="5" class="py-8 text-center text-text-muted text-xs italic">Chưa có dữ liệu tài khoản</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Tạo Cán bộ -->
    <div v-if="showCreateModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showCreateModal = false"></div>
      <div class="relative bg-white rounded-[24px] w-full max-w-md p-6 shadow-xl animate-scale-up">
        <h3 class="font-serif text-xl font-bold text-text-main mb-4">Tạo Tài Khoản Mới</h3>
        <form @submit.prevent="handleCreateAccount" class="space-y-4 text-left">
          <div class="space-y-1">
            <label class="text-xs font-bold text-text-main">Họ và Tên</label>
            <input type="text" v-model="form.fullName" required class="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary" />
          </div>
          <div class="space-y-1">
            <label class="text-xs font-bold text-text-main">Tên đăng nhập (Username)</label>
            <input type="text" v-model="form.username" required class="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary" />
          </div>
          <div class="space-y-1">
            <label class="text-xs font-bold text-text-main">Mật khẩu</label>
            <input type="password" v-model="form.password" required class="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary" />
          </div>
          <div class="space-y-1">
            <label class="text-xs font-bold text-text-main">Vai trò (Role)</label>
            <select v-model="form.role" class="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary">
              <option value="Staff">Cán bộ (Staff)</option>
              <option value="Admin">Quản trị (Admin)</option>
            </select>
          </div>
          <div class="flex gap-3 pt-2">
            <button type="button" @click="showCreateModal = false" class="flex-1 py-2.5 border border-border text-text-main font-semibold rounded-full hover:bg-background transition-colors cursor-pointer">Hủy</button>
            <button type="submit" class="flex-1 py-2.5 bg-primary text-white font-semibold rounded-full hover:bg-primary-hover shadow-sm transition-colors cursor-pointer">Lưu Tài Khoản</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
