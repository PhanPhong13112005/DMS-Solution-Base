<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Calendar, ArrowRight, ChevronRight, Mail, Search, AlertCircle, Undo2, Check } from 'lucide-vue-next';
import type { News } from '../types';
import { newsApi } from '../services/room-building.service';

const newsList = ref<News[]>([]);
const selectedCategory = ref<string>('Tất cả');
const selectedArticle = ref<News | null>(null);
const searchQuery = ref<string>('');

const loadNewsData = async () => {
  try {
    const res = await newsApi.getAll();
    if (res) newsList.value = res;
  } catch (error) {
    console.error('Lỗi tải dữ liệu tin tức:', error);
  }
};

onMounted(() => {
  loadNewsData();
});

const getCategoryName = (cat?: string) => {
  if (!cat || cat.trim() === '' || cat === 'string') {
    return 'Khác';
  }
  return cat;
};

const categories = computed(() => {
  // Tạo danh sách danh mục động dựa vào data có sẵn
  const cats = ['Tất cả'];
  newsList.value.forEach(item => {
    const catName = getCategoryName(item.category);
    if (!cats.includes(catName)) {
      cats.push(catName);
    }
  });
  
  return cats.map(name => ({
    name,
    count: name === 'Tất cả' 
      ? newsList.value.length 
      : newsList.value.filter(a => getCategoryName(a.category) === name).length
  }));
});

const filteredNews = computed(() => {
  return newsList.value.filter(item => {
    const itemCat = getCategoryName(item.category);
    const matchCat = selectedCategory.value === 'Tất cả' || selectedCategory.value === itemCat;
    
    const matchSearch = item.title.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                        item.content.toLowerCase().includes(searchQuery.value.toLowerCase());

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

        <div v-if="filteredNews.length > 0" class="space-y-6">
          <article v-for="item in filteredNews" :key="item.id" class="flex flex-col md:flex-row bg-white rounded-[32px] border border-[#EAE7E1] overflow-hidden shadow-xs">
            <div class="md:w-1/3 h-48 overflow-hidden">
              <img :src="item.imageUrl || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=400&q=80'" class="w-full h-full object-cover" />
            </div>
            <div class="md:w-2/3 p-6 flex flex-col justify-between">
              <div>
                <div class="text-xs font-bold text-[#CB997E] mb-2">{{ getCategoryName(item.category) }}</div>
                <h2 class="text-lg font-serif text-[#4A4A4A]">{{ item.title === 'string' ? 'Tiêu đề chưa cập nhật' : item.title }}</h2>
              </div>
              <button @click="selectedArticle = item" class="text-xs font-bold text-[#6B705C] mt-4 flex items-center">
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
              <button @click="selectedCategory = cat.name" :class="['w-full flex justify-between p-3 rounded-xl text-sm transition-colors', selectedCategory === cat.name ? 'bg-[#FDFBF7] font-bold text-[#CB997E]' : 'hover:bg-[#FDFBF7]']">
                {{ cat.name }} <span class="text-[#8B8B8B] text-xs">({{ cat.count }})</span>
              </button>
            </li>
          </ul>
        </div>
      </aside>
    </section>
  </div>
</template>