<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useAppData } from '../composables/useAppData';
import { billingApi } from '../services/billing.service';
import { Save, CheckCircle, Search, FilePlus, Edit2 } from 'lucide-vue-next';

const { rooms: _rooms } = useAppData();
const rooms = computed(() => _rooms.value || []);

const search = ref('');
const toast = ref<{ message: string; type: 'success' | 'error' } | null>(null);

const utilitiesData = ref<Record<string, { electricity: number; water: number; isSaved: boolean; isProcessed: boolean }>>({});

const filteredRooms = computed(() => {
  return rooms.value.filter(r => 
    r.roomNumber.toLowerCase().includes(search.value.toLowerCase()) || 
    (r.building && r.building.toLowerCase().includes(search.value.toLowerCase()))
  );
});

const showToast = (message: string, type: 'success' | 'error') => {
  toast.value = { message, type };
  setTimeout(() => toast.value = null, 3000);
};

const handleSaveUtility = async (room: any) => {
  const data = utilitiesData.value[room.id];
  if (!data || data.electricity < 0 || data.water < 0) {
    showToast('Chỉ số nhập vào không hợp lệ!', 'error');
    return;
  }
  
  try {
    await billingApi.utilities.record({
      roomId: room.id,
      electricityIndex: data.electricity,
      waterIndex: data.water
    });
    
    utilitiesData.value[room.id].isSaved = true;
    showToast(`Đã chốt điện nước cho phòng ${room.roomNumber}!`, 'success');
  } catch (error) {
    showToast('Có lỗi xảy ra khi chốt chỉ số.', 'error');
  }
};

const handleCreateUtilityBill = async (room: any) => {
  const data = utilitiesData.value[room.id];
  if (!data || data.electricity < 0 || data.water < 0) return;
  
  const elecCost = data.electricity * 3500;
  const waterCost = data.water * 25000;
  const totalCost = elecCost + waterCost;
  
  if (totalCost === 0) {
    showToast('Chỉ số bằng 0, không cần lập hóa đơn!', 'info');
    return;
  }
  
  try {
    await billingApi.invoices.createExtraFee({
      roomId: room.id,
      studentId: 0,
      reason: 'Tiền điện nước',
      description: `Thu tiền điện tiêu thụ (${data.electricity} kWh) và nước (${data.water} m3).`,
      amount: totalCost
    });
    utilitiesData.value[room.id].isProcessed = true;
    showToast(`Đã lập hóa đơn Điện Nước cho phòng ${room.roomNumber}!`, 'success');
  } catch (error) {
    showToast('Có lỗi xảy ra khi lập hóa đơn.', 'error');
  }
};

watch(() => rooms.value, (newRooms) => {
  if (newRooms) {
    newRooms.forEach(r => {
      if (!utilitiesData.value[r.id]) {
        utilitiesData.value[r.id] = { electricity: 0, water: 0, isSaved: false, isProcessed: false };
      }
    });
  }
}, { immediate: true, deep: true });

onMounted(async () => {

  // Fetch current month records to prefill UI
  try {
    const records = await billingApi.utilities.getCurrentMonth();
    if (records && Array.isArray(records)) {
      records.forEach((record: any) => {
        if (!utilitiesData.value[record.roomId]) {
          utilitiesData.value[record.roomId] = { electricity: 0, water: 0, isSaved: false, isProcessed: false };
        }
        utilitiesData.value[record.roomId].electricity = record.electricityIndex || 0;
        utilitiesData.value[record.roomId].water = record.waterIndex || 0;
        utilitiesData.value[record.roomId].isSaved = true; // DB already has it
        utilitiesData.value[record.roomId].isProcessed = record.isProcessed;
      });
    }
  } catch (err) {
    console.error('Failed to fetch current month utilities:', err);
  }
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
        <h3 class="font-serif text-text-main text-2xl font-bold">Chỉ số Điện Nước</h3>
        <p class="text-text-muted text-xs mt-1">Ghi nhận chỉ số tiêu thụ hàng tháng cho từng phòng</p>
      </div>
    </div>

    <div class="bg-white rounded-[32px] border border-border p-8 shadow-sm">
      <div class="relative max-w-md mb-6">
        <Search class="w-4 h-4 text-text-muted absolute left-4 top-1/2 -translate-y-1/2" />
        <input type="text" v-model="search" placeholder="Tìm kiếm phòng..." class="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-full text-xs outline-none focus:border-primary" />
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr class="text-[10px] font-bold text-text-muted uppercase tracking-wider border-b border-border">
              <th class="py-3 px-4">Tòa / Phòng</th>
              <th class="py-3 px-4 text-center">Trạng thái</th>
              <th class="py-3 px-4 text-center">Chỉ số Điện (kWh)</th>
              <th class="py-3 px-4 text-center">Chỉ số Nước (m³)</th>
              <th class="py-3 px-4 text-center">Thành tiền (VNĐ)</th>
              <th class="py-3 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="room in filteredRooms" :key="room.id" class="border-b border-border/50 hover:bg-background/50 transition-colors text-xs text-text-main">
              <td class="py-3 px-4">
                <div class="font-bold">{{ room.roomNumber }}</div>
                <div class="text-[10px] text-text-muted">{{ room.building || 'KTX' }}</div>
              </td>
              <td class="py-3 px-4 text-center">
                <span v-if="utilitiesData[room.id]?.isSaved" class="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold inline-flex items-center gap-1">
                  <CheckCircle class="w-3 h-3" /> Đã chốt
                </span>
                <span v-else class="px-2 py-1 bg-amber-100 text-amber-700 rounded text-[10px] font-bold inline-flex items-center gap-1">
                  Chưa chốt
                </span>
              </td>
              <td class="py-3 px-4 text-center">
                <div class="flex items-center justify-center">
                  <input type="number" min="0" v-model="utilitiesData[room.id].electricity" class="w-24 text-center bg-background border border-border rounded-lg px-2 py-1.5 outline-none focus:border-primary font-mono text-sm" :disabled="utilitiesData[room.id]?.isSaved" />
                </div>
              </td>
              <td class="py-3 px-4 text-center">
                <div class="flex items-center justify-center">
                  <input type="number" min="0" v-model="utilitiesData[room.id].water" class="w-24 text-center bg-background border border-border rounded-lg px-2 py-1.5 outline-none focus:border-primary font-mono text-sm" :disabled="utilitiesData[room.id]?.isSaved" />
                </div>
              </td>
              <td class="py-3 px-4 text-center">
                <div class="flex flex-col items-center justify-center">
                  <span class="font-bold font-mono text-secondary">
                    {{ new Intl.NumberFormat('vi-VN').format(
                      (utilitiesData[room.id]?.electricity || 0) * 3500 + 
                      (utilitiesData[room.id]?.water || 0) * 25000
                    ) }}đ
                  </span>
                  <span class="text-[9px] text-text-muted mt-0.5">(3.5k/kWh - 25k/khối)</span>
                </div>
              </td>
              <td class="py-3 px-4 text-right">
                <div class="flex justify-end items-center gap-2">
                  <button v-if="!utilitiesData[room.id]?.isSaved" @click="handleSaveUtility(room)" class="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm transition-colors cursor-pointer inline-flex items-center gap-1">
                    <Save class="w-3.5 h-3.5" /> Chốt số
                  </button>
                  <template v-else>
                    <button v-if="!utilitiesData[room.id]?.isProcessed" @click="handleCreateUtilityBill(room)" class="px-4 py-1.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg shadow-sm transition-colors cursor-pointer inline-flex items-center gap-1">
                      <FilePlus class="w-3.5 h-3.5" /> Lập Hóa Đơn
                    </button>
                    <span v-else class="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200">Đã lập HĐ</span>
                    
                    <button @click="utilitiesData[room.id].isSaved = false" class="px-3 py-1.5 bg-background border border-border hover:bg-background/50 text-text-main font-bold rounded-lg shadow-sm transition-colors cursor-pointer inline-flex items-center">
                      <Edit2 class="w-3.5 h-3.5 text-text-muted" />
                    </button>
                  </template>
                </div>
              </td>
            </tr>
            <tr v-if="filteredRooms.length === 0">
              <td colspan="5" class="py-8 text-center text-text-muted text-xs italic">Không tìm thấy phòng nào</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
