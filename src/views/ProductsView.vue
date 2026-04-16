<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import ProductCard from '../components/ProductCard.vue'
import GuestRestrictModal from '../components/GuestRestrictModal.vue'
import { products, categories, petTypes } from '../data/products'

const route = useRoute()
const showGuestModal = ref(false)

const selectedCategory = ref('全部')
const selectedPetType = ref('all')
const searchQuery = ref('')
const sortBy = ref('default')
const currentPage = ref(1)
const pageSize = 12
const isPageVisible = ref(false)
const showSearchSuggestions = ref(false)
const searchInputRef = ref(null)
const isSearchFocused = ref(false)
const visibleProducts = ref(new Set())
const productObserver = ref(null)

const SEARCH_HISTORY_KEY = 'pet-shop-search-history'
const searchHistory = ref(loadSearchHistory())

function loadSearchHistory() {
  try {
    const stored = localStorage.getItem(SEARCH_HISTORY_KEY)
    return stored ? JSON.parse(stored) : []
  } catch { return [] }
}

function saveSearchHistory(query) {
  if (!query.trim()) return
  const filtered = searchHistory.value.filter(h => h !== query.trim())
  searchHistory.value = [query.trim(), ...filtered].slice(0, 8)
  try { localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(searchHistory.value)) } catch {}
}

function removeSearchHistoryItem(query) {
  searchHistory.value = searchHistory.value.filter(h => h !== query)
  try { localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(searchHistory.value)) } catch {}
}

function clearSearchHistory() {
  searchHistory.value = []
  try { localStorage.removeItem(SEARCH_HISTORY_KEY) } catch {}
}

watch(() => route.query.category, (newCategory) => {
  selectedCategory.value = newCategory || '全部'
}, { immediate: true })

watch(() => route.query.search, (newSearch) => {
  searchQuery.value = newSearch || ''
}, { immediate: true })

watch([selectedCategory, selectedPetType, searchQuery, sortBy], () => {
  currentPage.value = 1
  nextTick(() => setupProductObserver())
})

const filteredProducts = computed(() => {
  let result = [...products]
  if (selectedCategory.value !== '全部') {
    result = result.filter(p => p.category === selectedCategory.value)
  }
  if (selectedPetType.value !== 'all') {
    result = result.filter(p => p.petType === selectedPetType.value || p.petType === 'all')
  }
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      p.tags.some(t => t.toLowerCase().includes(query))
    )
  }
  switch (sortBy.value) {
    case 'price-asc': result.sort((a, b) => a.price - b.price); break
    case 'price-desc': result.sort((a, b) => b.price - a.price); break
    case 'rating': result.sort((a, b) => b.rating - a.rating); break
    case 'reviews': result.sort((a, b) => b.reviews - a.reviews); break
  }
  return result
})

const totalPages = computed(() => Math.ceil(filteredProducts.value.length / pageSize) || 1)

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredProducts.value.slice(start, start + pageSize)
})

const pageNumbers = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, current - Math.floor(maxVisible / 2))
  let end = Math.min(total, start + maxVisible - 1)
  if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const searchSuggestions = computed(() => {
  if (!searchQuery.value.trim()) return []
  const query = searchQuery.value.toLowerCase().trim()
  return products
    .filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.tags.some(t => t.toLowerCase().includes(query))
    )
    .slice(0, 5)
})

const categoryIcons = {
  '全部': '📦',
  '猫粮': '🐱',
  '狗粮': '🐶',
  '玩具': '🎾',
  '用品': '🏠',
  '零食': '🍖',
  '猫砂': '🧹',
  '保健品': '💊',
  '清洁': '🧴',
}

const sortOptions = [
  { value: 'default', label: '默认排序', icon: '📋' },
  { value: 'price-asc', label: '价格从低到高', icon: '💰' },
  { value: 'price-desc', label: '价格从高到低', icon: '💎' },
  { value: 'rating', label: '好评优先', icon: '⭐' },
  { value: 'reviews', label: '销量优先', icon: '🔥' },
]

const activeSortLabel = computed(() => {
  const opt = sortOptions.find(o => o.value === sortBy.value)
  return opt ? `${opt.icon} ${opt.label}` : '📋 默认排序'
})

function setupProductObserver() {
  if (productObserver.value) productObserver.value.disconnect()
  visibleProducts.value = new Set()
  productObserver.value = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          visibleProducts.value.add(entry.target.dataset.productId)
        }
      })
    },
    { threshold: 0.05, rootMargin: '0px 0px -30px 0px' }
  )
  document.querySelectorAll('[data-product-id]').forEach((el) => {
    productObserver.value.observe(el)
  })
}

function isProductVisible(id) {
  return visibleProducts.value.has(String(id))
}

function handleSearchInput() {
  showSearchSuggestions.value = true
}

function handleSearchFocus() {
  isSearchFocused.value = true
  showSearchSuggestions.value = true
}

function handleSearchBlur() {
  setTimeout(() => {
    isSearchFocused.value = false
    showSearchSuggestions.value = false
  }, 200)
}

function handleSearchSubmit() {
  if (searchQuery.value.trim()) {
    saveSearchHistory(searchQuery.value.trim())
  }
  showSearchSuggestions.value = false
}

function selectSuggestion(product) {
  searchQuery.value = product.name
  saveSearchHistory(product.name)
  showSearchSuggestions.value = false
}

function useHistoryItem(query) {
  searchQuery.value = query
  showSearchSuggestions.value = false
}

function clearSearch() {
  searchQuery.value = ''
  showSearchSuggestions.value = false
  if (searchInputRef.value) searchInputRef.value.focus()
}

function handlePageChange(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
    nextTick(() => setupProductObserver())
  }
}

function resetFilters() {
  selectedCategory.value = '全部'
  selectedPetType.value = 'all'
  searchQuery.value = ''
  sortBy.value = 'default'
}

function getCategoryCount(cat) {
  if (cat === '全部') return products.length
  return products.filter(p => p.category === cat).length
}

onMounted(() => {
  setTimeout(() => {
    isPageVisible.value = true
    nextTick(() => setupProductObserver())
  }, 100)
})

onUnmounted(() => {
  if (productObserver.value) productObserver.value.disconnect()
})
</script>

<template>
  <div class="min-h-screen">
    <div class="w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8 mr-4">

      <div
        class="mb-8 transition-all duration-700"
        :class="isPageVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
      >
        <h1 class="text-3xl md:text-4xl font-bold text-text-dark font-pet mb-2">
          🛍️ 全部商品
        </h1>
        <p class="text-text-muted">
          共 <span class="font-semibold text-primary">{{ filteredProducts.length }}</span> 件商品
          <span v-if="searchQuery.trim()" class="ml-2 text-sm">
            搜索 "<span class="text-accent">{{ searchQuery }}</span>"
          </span>
        </p>
      </div>

      <div
        class="bg-card-bg rounded-2xl shadow-sm mb-8 border border-border/50 overflow-hidden transition-all duration-700"
        :class="isPageVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
        :style="{ transitionDelay: '100ms' }"
      >
        <div class="p-5 md:p-6">

          <div class="relative mb-5">
            <div class="flex gap-3">
              <div class="relative flex-1 max-w-lg">
                <div class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                  <svg class="w-5 h-5 text-text-light transition-colors" :class="isSearchFocused ? 'text-primary' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  ref="searchInputRef"
                  v-model="searchQuery"
                  type="text"
                  placeholder="搜索商品名称、分类、标签..."
                  class="w-full pl-12 pr-10 py-3 bg-surface-alt border border-border rounded-xl text-text-dark placeholder-text-light focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-base leading-relaxed"
                  :class="isSearchFocused ? 'shadow-md' : ''"
                  aria-label="搜索商品"
                  autocomplete="off"
                  @input="handleSearchInput"
                  @focus="handleSearchFocus"
                  @blur="handleSearchBlur"
                  @keyup.enter="handleSearchSubmit"
                />
                <button
                  v-if="searchQuery"
                  class="absolute inset-y-0 right-0 flex items-center pr-3"
                  aria-label="清除搜索"
                  @click="clearSearch"
                >
                  <div class="w-6 h-6 rounded-full bg-text-light/20 hover:bg-text-light/40 flex items-center justify-center transition-all">
                    <svg class="w-3.5 h-3.5 text-text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </button>

                <div
                  v-if="showSearchSuggestions && (searchSuggestions.length > 0 || (searchHistory.length > 0 && !searchQuery.trim()))"
                  class="absolute top-full left-0 right-0 mt-2 bg-card-bg border border-border rounded-xl shadow-xl z-30 overflow-hidden"
                >
                  <template v-if="searchQuery.trim() && searchSuggestions.length > 0">
                    <div class="px-4 py-2.5 text-xs font-medium text-text-light bg-surface-alt">
                      🔍 搜索建议
                    </div>
                    <button
                      v-for="product in searchSuggestions"
                      :key="product.id"
                      class="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/5 transition-colors text-left"
                      @mousedown.prevent="selectSuggestion(product)"
                    >
                      <span class="text-2xl">{{ product.emoji }}</span>
                      <div class="flex-1 min-w-0">
                        <div class="text-sm font-medium text-text-dark truncate">{{ product.name }}</div>
                        <div class="text-xs text-text-muted">{{ product.category }} · ¥{{ product.price }}</div>
                      </div>
                      <span class="text-xs text-primary font-semibold">¥{{ product.price }}</span>
                    </button>
                  </template>

                  <template v-if="!searchQuery.trim() && searchHistory.length > 0">
                    <div class="flex items-center justify-between px-4 py-2.5 bg-surface-alt">
                      <span class="text-xs font-medium text-text-light">🕐 搜索历史</span>
                      <button
                        class="text-xs text-text-light hover:text-accent transition-colors"
                        @mousedown.prevent="clearSearchHistory"
                      >
                        清除
                      </button>
                    </div>
                    <div class="max-h-48 overflow-y-auto">
                      <div
                        v-for="item in searchHistory"
                        :key="item"
                        class="flex items-center gap-2 px-4 py-2.5 hover:bg-primary/5 transition-colors group"
                      >
                        <button
                          class="flex-1 text-sm text-text-dark text-left truncate"
                          @mousedown.prevent="useHistoryItem(item)"
                        >
                          {{ item }}
                        </button>
                        <button
                          class="opacity-0 group-hover:opacity-100 text-text-light hover:text-accent transition-all shrink-0"
                          @mousedown.prevent="removeSearchHistoryItem(item)"
                        >
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </template>
                </div>
              </div>

              <div class="relative">
                <select
                  v-model="sortBy"
                  class="appearance-none pl-4 pr-10 py-3 bg-surface-alt border border-border rounded-xl text-sm text-text-dark focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all cursor-pointer font-medium"
                >
                  <option value="default">默认排序</option>
                  <option value="price-asc">价格从低到高</option>
                  <option value="price-desc">价格从高到低</option>
                  <option value="rating">好评优先</option>
                  <option value="reviews">销量优先</option>
                </select>
                <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div class="mb-4">
            <div class="flex items-center gap-2 mb-3">
              <span class="text-xs font-medium text-text-light uppercase tracking-wider">宠物类型</span>
              <div class="flex-1 h-px bg-border/50"></div>
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="pet in petTypes"
                :key="pet.value"
                class="px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300"
                :class="selectedPetType === pet.value
                  ? 'bg-primary text-white shadow-md shadow-primary/25'
                  : 'bg-surface-alt text-text-muted hover:bg-primary/10 hover:text-primary hover:shadow-sm'"
                @click="selectedPetType = pet.value"
              >
                {{ pet.label }}
              </button>
            </div>
          </div>

          <div>
            <div class="flex items-center gap-2 mb-3">
              <span class="text-xs font-medium text-text-light uppercase tracking-wider">商品分类</span>
              <div class="flex-1 h-px bg-border/50"></div>
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="cat in categories"
                :key="cat"
                class="group relative px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2"
                :class="selectedCategory === cat
                  ? 'bg-secondary text-white shadow-md shadow-secondary/25'
                  : 'bg-surface-alt text-text-muted hover:bg-secondary/10 hover:text-secondary hover:shadow-sm'"
                @click="selectedCategory = cat"
              >
                <span class="text-base transition-transform duration-300" :class="selectedCategory === cat ? 'scale-110' : 'group-hover:scale-110'">
                  {{ categoryIcons[cat] || '📦' }}
                </span>
                <span>{{ cat }}</span>
                <span
                  class="text-xs px-1.5 py-0.5 rounded-full transition-colors"
                  :class="selectedCategory === cat
                    ? 'bg-white/20 text-white'
                    : 'bg-border/50 text-text-light'"
                >
                  {{ getCategoryCount(cat) }}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div
          v-if="selectedCategory !== '全部' || selectedPetType !== 'all' || searchQuery.trim()"
          class="px-5 md:px-6 py-3 bg-surface-alt/50 border-t border-border/30 flex items-center gap-2 flex-wrap"
        >
          <span class="text-xs text-text-light">已筛选：</span>
          <span
            v-if="selectedPetType !== 'all'"
            class="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full"
          >
            {{ petTypes.find(p => p.value === selectedPetType)?.label }}
            <button class="hover:text-accent transition-colors" @click="selectedPetType = 'all'">✕</button>
          </span>
          <span
            v-if="selectedCategory !== '全部'"
            class="inline-flex items-center gap-1 px-3 py-1 bg-secondary/10 text-secondary text-xs font-medium rounded-full"
          >
            {{ selectedCategory }}
            <button class="hover:text-accent transition-colors" @click="selectedCategory = '全部'">✕</button>
          </span>
          <span
            v-if="searchQuery.trim()"
            class="inline-flex items-center gap-1 px-3 py-1 bg-accent/10 text-accent text-xs font-medium rounded-full"
          >
            "{{ searchQuery }}"
            <button class="hover:text-accent/70 transition-colors" @click="searchQuery = ''">✕</button>
          </span>
          <button
            class="text-xs text-text-light hover:text-accent transition-colors ml-auto"
            @click="resetFilters"
          >
            清除全部
          </button>
        </div>
      </div>

      <div v-if="filteredProducts.length > 0">
        <div class="flex items-center justify-between mb-5">
          <p class="text-sm text-text-muted">
            显示 <span class="font-medium text-text-dark">{{ (currentPage - 1) * pageSize + 1 }}-{{ Math.min(currentPage * pageSize, filteredProducts.length) }}</span> 件，共 {{ filteredProducts.length }} 件
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          <div
            v-for="product in paginatedProducts"
            :key="product.id"
            :data-product-id="String(product.id)"
            class="transition-all duration-600"
            :class="isProductVisible(product.id) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
          >
            <ProductCard
              :product="product"
              @require-login="showGuestModal = true"
            />
          </div>
        </div>

        <div
          v-if="totalPages > 1"
          class="flex items-center justify-center gap-2 mt-12"
        >
          <button
            class="h-10 px-4 rounded-xl flex items-center gap-1.5 text-sm font-medium transition-all"
            :class="currentPage === 1
              ? 'text-text-light cursor-not-allowed'
              : 'text-text-dark hover:bg-primary/10 hover:text-primary'"
            :disabled="currentPage === 1"
            @click="handlePageChange(currentPage - 1)"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            上一页
          </button>

          <div class="flex items-center gap-1">
            <button
              v-for="page in pageNumbers"
              :key="page"
              class="w-10 h-10 rounded-xl text-sm font-medium transition-all"
              :class="page === currentPage
                ? 'bg-primary text-white shadow-md shadow-primary/25'
                : 'text-text-dark hover:bg-primary/10'"
              :aria-label="`第${page}页`"
              :aria-current="page === currentPage ? 'page' : undefined"
              @click="handlePageChange(page)"
            >
              {{ page }}
            </button>
          </div>

          <button
            class="h-10 px-4 rounded-xl flex items-center gap-1.5 text-sm font-medium transition-all"
            :class="currentPage === totalPages
              ? 'text-text-light cursor-not-allowed'
              : 'text-text-dark hover:bg-primary/10 hover:text-primary'"
            :disabled="currentPage === totalPages"
            @click="handlePageChange(currentPage + 1)"
          >
            下一页
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div v-else class="text-center py-20">
        <span class="text-7xl block mb-6 animate-float">🔍</span>
        <h3 class="text-2xl font-bold text-text-dark mb-3">没有找到相关商品</h3>
        <p class="text-text-muted mb-8">试试其他搜索词或筛选条件</p>
        <button
          class="px-8 py-3 bg-primary/10 text-primary font-semibold rounded-full hover:bg-primary hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
          @click="resetFilters"
        >
          重置筛选
        </button>
      </div>
    </div>

    <div
      v-if="showSearchSuggestions"
      class="fixed inset-0 z-20"
      @click="showSearchSuggestions = false"
    ></div>

    <GuestRestrictModal v-model:show="showGuestModal" message="请先登录后再添加购物车" />
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
