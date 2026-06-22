<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import { Calendar, ArrowRight, ChevronRight, Mail, Search, AlertCircle, Undo2, Check } from 'lucide-vue-next';
import type { NewsArticle } from '../types';

// Lấy dữ liệu từ "đường ống" provide trong App.vue
const appData: any = inject('appData');

// Sửa lỗi: Truy cập an toàn vào appData.news (đảm bảo là mảng)
const articlesList = computed(() => {
  if (appData && appData.news) {
    // Nếu appData.news là một ref, lấy .value, nếu là mảng thường thì lấy trực tiếp
    const data = appData.news.value || appData.news;
    return Array.isArray(data) ? data : [];
  }
  return [];
});

const selectedCategory = ref<string>('Tất cả');
const selectedArticle = ref<NewsArticle | null>(null);
const emailInput = ref<string>('');
const subscribeStatus = ref<'idle' | 'success' | 'error'>('idle');
const searchQuery = ref<string>('');

const categories = computed(() => [
  { name: 'Tất cả', count: articlesList.value.length },
  { name: 'Thông báo chung', count: articlesList.value.filter((a: any) => a.category === 'THÔNG BÁO').length + 5 },
  { name: 'Tin tức sự kiện', count: articlesList.value.filter((a: any) => a.category === 'SỰ KIỆN').length + 3 },
  { name: 'Hoạt động SV', count: articlesList.value.filter((a: any) => a.category === 'HOẠT ĐỘNG SV').length + 4 },
  { name: 'Quy định - Thủ tục', count: articlesList.value.filter((a: any) => a.category === 'Quy định - Thủ tục').length + 2 }
]);

const filteredArticles = computed(() => {
  return articlesList.value.filter((art: any) => {
    const matchCat = selectedCategory.value === 'Tất cả' || 
                    (selectedCategory.value === 'Thông báo chung' && art.category === 'THÔNG BÁO') ||
                    (selectedCategory.value === 'Tin tức sự kiện' && art.category === 'SỰ KIỆN') ||
                    (selectedCategory.value === 'Hoạt động SV' && art.category === 'HOẠT ĐỘNG SV') ||
                    (selectedCategory.value === 'Quy định - Thủ tục' && art.category === 'Quy định - Thủ tục');

    const matchSearch = art.title.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                        art.summary.toLowerCase().includes(searchQuery.value.toLowerCase());

    return matchCat && matchSearch;
  });
});
</script>

<template>
  <div class="w-full text-left bg-[#FDFBF7] text-[#4A4A4A] min-h-screen">
    <section class="bg-[#A5A58D] text-white py-12 px-6">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-3xl md:text-5xl font-serif font-light uppercase mb-3">Tin tức & <span class="italic font-normal text-[#CB997E]">Sự kiện</span></h1>
        <p class="text-base text-white/90 font-light max-w-2xl">Cập nhật mọi thông báo chính thức và tin tức đời sống Ký túc xá.</p>
      </div>
    </section>

    <section class="py-16 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 space-y-6">
        <div class="relative w-full">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B8B8B] w-5 h-5" />
          <input type="text" v-model="searchQuery" placeholder="Tìm kiếm tin tức..." class="w-full bg-white border border-[#EAE7E1] rounded-2xl pl-12 pr-4 py-3.5 text-sm outline-none focus:border-[#6B705C]" />
        </div>

        <div v-if="filteredArticles.length > 0" class="space-y-6">
          <article v-for="article in filteredArticles" :key="article.id" class="flex flex-col md:flex-row bg-white rounded-[32px] border border-[#EAE7E1] overflow-hidden shadow-xs">
            <div class="md:w-1/3 h-48 overflow-hidden">
              <img :src="article.image" class="w-full h-full object-cover" />
            </div>
            <div class="md:w-2/3 p-6 flex flex-col justify-between">
              <div>
                <div class="text-xs font-bold text-[#CB997E] mb-2">{{ article.category }}</div>
                <h2 class="text-lg font-serif text-[#4A4A4A]">{{ article.title }}</h2>
              </div>
              <button @click="selectedArticle = article" class="text-xs font-bold text-[#6B705C] mt-4 flex items-center">
                Đọc tiếp <ArrowRight class="w-4 h-4 ml-2" />
              </button>
            </div>
          </article>
        </div>
        <div v-else class="p-12 text-center text-[#8B8B8B] bg-white rounded-[32px] border border-[#EAE7E1]">
          Chưa có tin tức nào được cập nhật.
        </div>
      </div>

      <aside class="space-y-6">
        <div class="bg-white rounded-[32px] border border-[#EAE7E1] p-5">
          <h3 class="font-serif mb-4 text-[#4A4A4A]">Danh mục</h3>
          <ul class="space-y-2">
            <li v-for="cat in categories" :key="cat.name">
              <button @click="selectedCategory = cat.name" class="w-full flex justify-between p-3 rounded-xl hover:bg-[#FDFBF7] text-sm">
                {{ cat.name }} <span class="text-[#8B8B8B] text-xs">({{ cat.count }})</span>
              </button>
            </li>
          </ul>
        </div>
      </aside>
    </section>
  </div>
</template>