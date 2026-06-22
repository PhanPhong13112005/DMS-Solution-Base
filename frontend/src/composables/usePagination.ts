import { ref, computed, type Ref } from 'vue';

export function usePagination<T>(items: Ref<T[]>, itemsPerPage: number = 5) {
  const currentPage = ref(1);

  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    return items.value.slice(start, start + itemsPerPage);
  });

  const totalPages = computed(() => {
    return Math.max(1, Math.ceil(items.value.length / itemsPerPage));
  });

  const nextPage = () => {
    if (currentPage.value < totalPages.value) currentPage.value++;
  };

  const prevPage = () => {
    if (currentPage.value > 1) currentPage.value--;
  };

  const setPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) currentPage.value = page;
  };

  return {
    currentPage,
    paginatedItems,
    totalPages,
    nextPage,
    prevPage,
    setPage
  };
}
