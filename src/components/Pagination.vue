<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  currentPage: number
  totalPages: number
  maxVisiblePages?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxVisiblePages: 10
})

const emit = defineEmits<{
  (e: 'update:currentPage', page: number): void
}>()

const getPageRange = computed(() => {
  const range = []
  const startPage = Math.max(1, props.currentPage - Math.floor(props.maxVisiblePages / 2))
  const endPage = Math.min(props.totalPages, startPage + props.maxVisiblePages - 1)

  for (let i = startPage; i <= endPage; i++) {
    range.push(i)
  }
  return range
})

const changePage = (page: number) => {
  if (page >= 1 && page <= props.totalPages) {
    emit('update:currentPage', page)
  }
}
</script>

<template>
  <div class="pagination" v-if="totalPages > 1">
    <button 
      @click="changePage(currentPage - 1)"
      :disabled="currentPage === 1"
      class="page-button prev-next"
    >
      ‹
    </button>

    <button 
      v-for="page in getPageRange" 
      :key="page"
      @click="changePage(page)"
      class="page-button"
      :class="{ active: currentPage === page }"
    >
      {{ page }}
    </button>

    <span v-if="getPageRange[getPageRange.length - 1] < totalPages - 1" class="page-dots">
      ...
    </span>

    <button 
      v-if="getPageRange[getPageRange.length - 1] < totalPages"
      @click="changePage(totalPages)"
      class="page-button"
      :class="{ active: currentPage === totalPages }"
    >
      {{ totalPages }}
    </button>

    <button 
      @click="changePage(currentPage + 1)"
      :disabled="currentPage === totalPages"
      class="page-button prev-next"
    >
      ›
    </button>
  </div>
</template>

<style scoped>
.pagination {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
  padding: 15px;
  flex-shrink: 0;
  border-top: 1px solid #e0e0e0;
}

.page-button {
  min-width: 34px;
  height: 34px;
  padding: 0;
  border: none;
  background-color: #f3f5f8;
  color: #6b7785;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.page-button:hover:not(:disabled):not(.active) {
  background-color: #e0e0e0;
}

.page-button.active {
  background-color: #4382D0;
  color: white;
}

.page-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.prev-next {
  font-size: 18px;
  font-weight: bold;
}

.page-dots {
  padding: 0 5px;
  color: #666;
}
</style> 