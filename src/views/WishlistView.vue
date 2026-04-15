<script setup>
import { computed, ref, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useWishlistStore } from '../stores/wishlist'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'
import { useToast } from '../composables/useToast'
import GuestRestrictModal from '../components/GuestRestrictModal.vue'

const router = useRouter()
const wishlistStore = useWishlistStore()
const cartStore = useCartStore()
const authStore = useAuthStore()
const toast = useToast()

const showGuestModal = ref(false)
const isLoading = ref(true)
const batchMode = ref(false)
const showSortDropdown = ref(false)
const searchInput = ref('')
const removingItems = ref(new Set())
const addingToCart = ref(new Set())
const cardRefs = ref([])

const sortOptions = [
  { value: 'time-desc', label: '最近收藏', icon: '🕐' },
  { value: 'time-asc', label: '最早收藏', icon: '📅' },
  { value: 'price-asc', label: '价格从低到高', icon: '💰' },
  { value: 'price-desc', label: '价格从高到低', icon: '💎' },
  { value: 'rating-desc', label: '评分最高', icon: '⭐' },
  { value: 'discount-desc', label: '折扣最大', icon: '🔥' },
]

const currentSortLabel = computed(() => {
  const opt = sortOptions.find(o => o.value === wishlistStore.sortBy)
  return opt ? opt.label : '最近收藏'
})

const isEmpty = computed(() => wishlistStore.items.length === 0)
const isFilteredEmpty = computed(() => wishlistStore.filteredItems.length === 0 && !isEmpty.value)

const pageNumbers = computed(() => {
  const total = wishlistStore.totalPages
  const current = wishlistStore.currentPage
  const pages = []
  const maxVisible = 5

  let start = Math.max(1, current - Math.floor(maxVisible / 2))
  let end = Math.min(total, start + maxVisible - 1)

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

setTimeout(() => {
  isLoading.value = false
}, 300)

watch(() => wishlistStore.activeCategory, () => {
  searchInput.value = wishlistStore.searchQuery
})

function goToProduct(productId) {
  router.push(`/product/${productId}`)
}

function handleSearch() {
  wishlistStore.setSearch(searchInput.value)
}

function clearSearch() {
  searchInput.value = ''
  wishlistStore.setSearch('')
}

function handleRemove(productId) {
  removingItems.value.add(productId)
  setTimeout(() => {
    wishlistStore.removeFromWishlist(productId)
    removingItems.value.delete(productId)
    toast.success('已取消收藏')
  }, 300)
}

function handleAddToCart(item) {
  if (!authStore.isLoggedIn) {
    showGuestModal.value = true
    return
  }
  addingToCart.value.add(item.id)
  setTimeout(() => {
    cartStore.addToCart(item)
    wishlistStore.removeFromWishlist(item.id)
    addingToCart.value.delete(item.id)
    toast.success('已加入购物车')
  }, 400)
}

function handleClear() {
  if (confirm('确定要清空所有收藏吗？此操作不可恢复。')) {
    wishlistStore.clearWishlist()
    toast.success('已清空收藏')
  }
}

function handleAddAllToCart() {
  if (!authStore.isLoggedIn) {
    showGuestModal.value = true
    return
  }
  const items = [...wishlistStore.filteredItems]
  items.forEach(item => cartStore.addToCart(item))
  wishlistStore.clearWishlist()
  toast.success(`已将 ${items.length} 件商品加入购物车`)
}

function handleBatchRemove() {
  if (wishlistStore.selectedCount === 0) {
    toast.info('请先选择商品')
    return
  }
  if (confirm(`确定要移除选中的 ${wishlistStore.selectedCount} 件商品吗？`)) {
    wishlistStore.removeSelected()
    batchMode.value = false
    toast.success('已移除选中商品')
  }
}

function handleBatchAddToCart() {
  if (!authStore.isLoggedIn) {
    showGuestModal.value = true
    return
  }
  if (wishlistStore.selectedCount === 0) {
    toast.info('请先选择商品')
    return
  }
  const selectedIds = [...wishlistStore.selectedItems]
  const selectedProducts = wishlistStore.filteredItems.filter(item => selectedIds.includes(item.id))
  selectedProducts.forEach(item => cartStore.addToCart(item))
  wishlistStore.removeSelected()
  batchMode.value = false
  toast.success(`已将 ${selectedProducts.length} 件商品加入购物车`)
}

function toggleBatchMode() {
  batchMode.value = !batchMode.value
  if (!batchMode.value) {
    wishlistStore.clearSelection()
  }
}

function toggleSortDropdown() {
  showSortDropdown.value = !showSortDropdown.value
}

function selectSort(value) {
  wishlistStore.setSortBy(value)
  showSortDropdown.value = false
}

function handlePageChange(page) {
  wishlistStore.goToPage(page)
  nextTick(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
}

function getDiscount(item) {
  if (item.originalPrice && item.originalPrice > item.price) {
    return Math.round((1 - item.price / item.originalPrice) * 100)
  }
  return 0
}
</script>

<template>
  <div class="min-h-screen">
    <div class="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-8 mr-4">
      <div class="mb-8">
        <div class="flex items-center justify-between w-full mb-2">
          <h1 class="text-3xl md:text-4xl font-bold text-text-dark font-pet">
            ❤️ 我的收藏
          </h1>
          <div v-if="!isEmpty && authStore.isLoggedIn" class="flex items-center gap-2">
            <button
              class="px-4 py-2 text-sm font-medium rounded-full transition-all duration-200"
              :class="batchMode
                ? 'bg-accent text-white shadow-md'
                : 'bg-card-bg text-text-muted hover:text-accent border border-border'"
              @click="toggleBatchMode"
            >
              {{ batchMode ? '退出批量' : '📋 批量操作' }}
            </button>
          </div>
        </div>
        <p class="text-text-muted mt-2">
          共 <span class="font-semibold text-primary">{{ wishlistStore.count }}</span> 件收藏商品
        </p>
      </div>

      <div
        v-if="!authStore.isLoggedIn"
        class="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center"
      >
        <span class="text-5xl block mb-4">🔒</span>
        <h3 class="text-xl font-semibold text-amber-800 mb-2">登录后查看收藏</h3>
        <p class="text-amber-700 mb-6">登录后可同步您的收藏商品</p>
        <router-link
          to="/login"
          class="inline-block px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-full transition-all shadow-md hover:shadow-lg"
        >
          立即登录
        </router-link>
      </div>

      <div v-else-if="isLoading" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
        <div
          v-for="i in 6"
          :key="i"
          class="bg-card-bg rounded-2xl overflow-hidden animate-pulse"
        >
          <div class="w-full aspect-square bg-surface-alt"></div>
          <div class="p-4 space-y-3">
            <div class="h-4 bg-surface-alt rounded w-3/4"></div>
            <div class="h-4 bg-surface-alt rounded w-1/2"></div>
            <div class="h-8 bg-surface-alt rounded"></div>
          </div>
        </div>
      </div>

      <div v-else-if="isEmpty" class="text-center py-20">
        <span class="text-8xl block mb-6 animate-float">❤️</span>
        <h2 class="text-2xl font-bold text-text-dark mb-3">还没有收藏商品</h2>
        <p class="text-text-muted mb-8">快去挑选您爱宠需要的商品吧！</p>
        <router-link
          to="/products"
          class="inline-block px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          去逛逛 →
        </router-link>
      </div>

      <template v-else>
        <div class="mb-6 space-y-4">
          <div class="flex flex-col sm:flex-row gap-3">
            <div class="relative flex-1 max-w-md">
              <svg
                class="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                v-model="searchInput"
                type="text"
                placeholder="搜索收藏商品..."
                class="w-full pl-11 pr-10 py-3 bg-card-bg border border-border rounded-xl text-text-dark placeholder-text-light focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                aria-label="搜索收藏商品"
                @input="handleSearch"
              />
              <button
                v-if="searchInput"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-text-light hover:text-text-dark transition-colors"
                aria-label="清除搜索"
                @click="clearSearch"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="relative">
              <button
                class="flex items-center gap-2 px-5 py-3 bg-card-bg border border-border rounded-xl text-text-dark hover:border-primary transition-all"
                @click="toggleSortDropdown"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
                <span class="text-sm font-medium">{{ currentSortLabel }}</span>
              </button>
              <div
                v-if="showSortDropdown"
                class="absolute right-0 top-full mt-2 w-52 bg-card-bg border border-border rounded-xl shadow-xl z-30 overflow-hidden"
              >
                <button
                  v-for="opt in sortOptions"
                  :key="opt.value"
                  class="w-full flex items-center gap-3 px-4 py-3 text-sm text-text-dark hover:bg-primary/10 transition-colors"
                  :class="wishlistStore.sortBy === opt.value ? 'bg-primary/5 text-primary font-medium' : ''"
                  @click="selectSort(opt.value)"
                >
                  <span>{{ opt.icon }}</span>
                  <span>{{ opt.label }}</span>
                  <svg
                    v-if="wishlistStore.sortBy === opt.value"
                    class="w-4 h-4 ml-auto text-primary"
                    fill="currentColor" viewBox="0 0 20 20"
                  >
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              v-for="cat in wishlistStore.categories"
              :key="cat"
              class="shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200"
              :class="wishlistStore.activeCategory === cat
                ? 'bg-primary text-white shadow-md'
                : 'bg-card-bg text-text-muted hover:text-primary border border-border'"
              @click="wishlistStore.setCategory(cat)"
            >
              {{ cat === '全部' ? '📦 ' + cat : cat }}
            </button>
          </div>

          <div
            v-if="batchMode"
            class="flex flex-wrap items-center gap-3 p-4 bg-accent/5 border border-accent/20 rounded-xl"
          >
            <button
              class="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all"
              :class="wishlistStore.isAllSelected
                ? 'bg-accent text-white'
                : 'bg-card-bg text-text-dark border border-border hover:border-accent'"
              @click="wishlistStore.toggleSelectAll()"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  v-if="wishlistStore.isAllSelected"
                  stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
                <path
                  v-else
                  stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {{ wishlistStore.isAllSelected ? '取消全选' : '全选' }}
            </button>
            <span class="text-sm text-text-muted">
              已选 <span class="font-semibold text-accent">{{ wishlistStore.selectedCount }}</span> 件
            </span>
            <div class="flex-1"></div>
            <button
              class="px-4 py-2 text-sm font-medium bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="wishlistStore.selectedCount === 0"
              @click="handleBatchAddToCart"
            >
              🛒 加入购物车
            </button>
            <button
              class="px-4 py-2 text-sm font-medium bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="wishlistStore.selectedCount === 0"
              @click="handleBatchRemove"
            >
              🗑️ 移除
            </button>
          </div>
        </div>

        <div v-if="isFilteredEmpty" class="text-center py-16">
          <span class="text-6xl block mb-4">🔍</span>
          <h3 class="text-xl font-bold text-text-dark mb-2">未找到匹配商品</h3>
          <p class="text-text-muted mb-6">试试其他搜索词或筛选条件</p>
          <button
            class="px-6 py-2.5 bg-primary/10 text-primary font-medium rounded-full hover:bg-primary hover:text-white transition-all"
            @click="clearSearch(); wishlistStore.setCategory('全部')"
          >
            清除筛选
          </button>
        </div>

        <div v-else>
          <div class="flex items-center justify-between mb-4">
            <p class="text-sm text-text-muted">
              显示 {{ (wishlistStore.currentPage - 1) * wishlistStore.pageSize + 1 }}-{{ Math.min(wishlistStore.currentPage * wishlistStore.pageSize, wishlistStore.totalFiltered) }} 件，共 {{ wishlistStore.totalFiltered }} 件
            </p>
            <div v-if="!batchMode" class="flex items-center gap-2">
              <button
                class="px-4 py-2 text-sm text-text-muted hover:text-primary transition-colors"
                @click="handleAddAllToCart"
              >
                🛒 全部加购
              </button>
              <button
                class="px-4 py-2 text-sm text-text-muted hover:text-accent transition-colors"
                @click="handleClear"
              >
                🗑️ 清空收藏
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
            <div
              v-for="(item, index) in wishlistStore.paginatedItems"
              :key="item.id"
              class="group relative bg-card-bg rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              :class="{
                'ring-2 ring-accent': batchMode && wishlistStore.selectedItems.has(item.id),
                'opacity-0 scale-95': removingItems.has(item.id),
                'opacity-100 scale-100': !removingItems.has(item.id),
              }"
              :style="{ transitionDelay: `${index * 50}ms` }"
            >
              <div
                v-if="batchMode"
                class="absolute top-3 left-3 z-20"
              >
                <button
                  class="w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all"
                  :class="wishlistStore.selectedItems.has(item.id)
                    ? 'bg-accent border-accent text-white'
                    : 'bg-white/80 border-border text-transparent hover:border-accent'"
                  :aria-label="wishlistStore.selectedItems.has(item.id) ? '取消选择' : '选择商品'"
                  @click="wishlistStore.toggleSelectItem(item.id)"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </div>

              <button
                v-if="!batchMode"
                class="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-50 hover:scale-110"
                aria-label="取消收藏"
                @click.stop="handleRemove(item.id)"
              >
                <svg class="w-4 h-4 text-text-light hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div
                v-if="getDiscount(item) > 0"
                class="absolute top-3 right-3 z-10 bg-accent text-white text-xs font-bold px-2.5 py-1 rounded-full"
                :class="{ 'hidden': !batchMode }"
              >
                -{{ getDiscount(item) }}%
              </div>

              <div
                class="w-full aspect-square flex items-center justify-center cursor-pointer group-hover:scale-105 transition-transform duration-500"
                :class="item.bgColor || 'bg-warm-bg-alt'"
                @click="!batchMode && goToProduct(item.id)"
              >
                <span class="text-6xl md:text-7xl select-none transition-transform duration-300 group-hover:scale-110">
                  {{ item.emoji || '🐾' }}
                </span>
              </div>

              <div class="p-4">
                <h3
                  class="text-sm font-semibold text-text-dark truncate mb-1.5 cursor-pointer hover:text-primary transition-colors"
                  @click="!batchMode && goToProduct(item.id)"
                >
                  {{ item.name }}
                </h3>

                <div class="flex items-center gap-1.5 mb-2">
                  <span class="text-amber-500 text-sm">★</span>
                  <span class="text-xs text-text-muted">{{ item.rating || '-' }}</span>
                  <span v-if="item.category" class="text-xs text-text-light ml-auto bg-surface-alt px-2 py-0.5 rounded-full">
                    {{ item.category }}
                  </span>
                </div>

                <div class="flex items-baseline gap-2 mb-3">
                  <span class="text-lg font-bold text-primary">¥{{ item.price }}</span>
                  <span v-if="item.originalPrice && item.originalPrice > item.price" class="text-xs text-text-light line-through">
                    ¥{{ item.originalPrice }}
                  </span>
                </div>

                <button
                  v-if="!batchMode"
                  class="w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-300"
                  :class="addingToCart.has(item.id)
                    ? 'bg-success text-white'
                    : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'"
                  :disabled="addingToCart.has(item.id)"
                  @click="handleAddToCart(item)"
                >
                  {{ addingToCart.has(item.id) ? '✓ 已加入' : '🛒 加入购物车' }}
                </button>
              </div>
            </div>
          </div>

          <div
            v-if="wishlistStore.totalPages > 1"
            class="flex items-center justify-center gap-2 mt-10"
          >
            <button
              class="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
              :class="wishlistStore.currentPage === 1
                ? 'text-text-light cursor-not-allowed'
                : 'text-text-dark hover:bg-primary/10 hover:text-primary'"
              :disabled="wishlistStore.currentPage === 1"
              aria-label="上一页"
              @click="handlePageChange(wishlistStore.currentPage - 1)"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              v-for="page in pageNumbers"
              :key="page"
              class="w-10 h-10 rounded-xl text-sm font-medium transition-all"
              :class="page === wishlistStore.currentPage
                ? 'bg-primary text-white shadow-md'
                : 'text-text-dark hover:bg-primary/10'"
              :aria-label="`第${page}页`"
              :aria-current="page === wishlistStore.currentPage ? 'page' : undefined"
              @click="handlePageChange(page)"
            >
              {{ page }}
            </button>

            <button
              class="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
              :class="wishlistStore.currentPage === wishlistStore.totalPages
                ? 'text-text-light cursor-not-allowed'
                : 'text-text-dark hover:bg-primary/10 hover:text-primary'"
              :disabled="wishlistStore.currentPage === wishlistStore.totalPages"
              aria-label="下一页"
              @click="handlePageChange(wishlistStore.currentPage + 1)"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </template>
    </div>

    <div
      v-if="showSortDropdown"
      class="fixed inset-0 z-20"
      @click="showSortDropdown = false"
    ></div>

    <GuestRestrictModal v-model:show="showGuestModal" message="请先登录后再操作" />
  </div>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
